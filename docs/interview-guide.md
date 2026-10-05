# TaskFlow Technical Interview Guide

*Designed for a developer with strong PHP/Laravel/MySQL experience demonstrating a full-stack production application to senior interviewers.*

---

## 1. Project High-Level Architecture
TaskFlow is a decoupled full-stack application:
- **Backend**: Laravel 11 running on PHP 8.3. Exposes a clean, RESTful JSON API using Laravel Sanctum for token authentication, Form Requests for authoritative validation, Policies for role-based access control (RBAC), and Eloquent API Resources for data transformations.
- **Frontend**: Single-Page Application (SPA) built with React 18 and Vite. It consumes the Laravel API via Axios, uses React Router v6 for client-side routing, and relies on React's Context API (`AuthContext`, `ToastContext`) for global session and notification state.
- **Database**: MySQL 8.0 with InnoDB engine, enforcing foreign key integrity (`cascadeOnDelete` and `restrictOnDelete`), and composite B-Tree indexes matching real query patterns.

---

## 2. Authentication & Authorization Deep Dive

### Authentication Flow (Sanctum Tokens)
1. User submits email and password to `POST /api/login`.
2. Laravel's `AuthController` normalizes the email, then invokes `Auth::attempt(['email' => $email, 'password' => $password])`.
3. Under the hood, Laravel pulls the user record by email and executes `password_verify()` using Bcrypt.
4. If valid, Sanctum generates a cryptographically secure random token (`$user->createToken('taskflow-auth-token')->plainTextToken`). The hash is stored in the `personal_access_tokens` table.
5. The plain-text token is returned to the React client and saved in browser `localStorage`.
6. Subsequent requests attach the token in the `Authorization: Bearer <token>` header via an Axios request interceptor.

### 401 Unauthorized vs 403 Forbidden (Classic Interview Question!)
- **`401 Unauthorized` (Unauthenticated)**: The client has *not* proven who they are. They either provided no token, an invalid token, or an expired session.
  - *Example*: Requesting `/api/tasks` without the `Authorization` header returns `401`.
- **`403 Forbidden` (Unauthorized)**: The client *is* successfully authenticated (we know who they are), but their role or identity does *not* grant permission to perform the requested operation.
  - *Example*: User Elena (`user_id = 2`) tries to edit Sarah's task (`user_id = 3`) via `PUT /api/tasks/10`. Elena is logged in, but `TaskPolicy::update()` returns `false`, resulting in `403 Forbidden`.

---

## 3. Database Indexing & EXPLAIN Analysis

### What makes the index `(user_id, status, due_date)` optimal?
When an authenticated user loads their tasks:
```sql
SELECT id, title, status, priority, due_date 
FROM tasks 
WHERE user_id = 2 AND status = 'todo' 
ORDER BY due_date ASC 
LIMIT 10;
```
- **Without the composite index**: MySQL would do a scan, find matching rows, write them to a temporary memory buffer, and perform a sorting pass (`Using filesort`).
- **With composite index `(user_id, status, due_date)`**:
  - The B-Tree branches first on `user_id = 2`.
  - Inside that branch, it seeks `status = 'todo'`.
  - Within those leaf nodes, the records are **already ordered by `due_date ASC`** physically on disk!
  - MySQL simply reads the first 10 leaf entries and returns them immediately without sorting.
  - Actual measured `EXPLAIN ANALYZE` time: **0.068 ms** with `Extra: NULL` (no filesort!).

### The Left-to-Right Index Rule
An index on `(A, B, C)` can serve:
- `WHERE A = ?`
- `WHERE A = ? AND B = ?`
- `WHERE A = ? AND B = ? AND C = ?`
- `WHERE A = ? AND B = ? ORDER BY C`
It CANNOT serve:
- `WHERE B = ?` (without A)
- `WHERE C = ?` (without A and B)

---

## 4. React SPA for Laravel Developers

### Component Lifecycle & Hooks
1. **`useState`**: Stores component-local state.
   - *Example*: `const [tasks, setTasks] = useState([]);`
   - Calling `setTasks(newData)` triggers React to re-render the component with the new data.
2. **`useEffect`**: Performs side effects (like data fetching or event subscriptions) after rendering.
   - *Example*:
     ```jsx
     useEffect(() => {
       fetchTasks();
     }, [fetchTasks]);
     ```
   - The dependency array `[fetchTasks]` ensures the effect only runs when the dependencies change, preventing infinite fetch loops.
3. **`useCallback`**: Memoizes a function instance so it isn't recreated on every single render.
   - Used on `fetchTasks` so child components or `useEffect` hooks don't trigger unnecessary re-renders.
4. **`useDebounce`**: A custom hook that delays updating a state value until the user pauses typing (350ms).
   - This prevents making 10 API requests while a user types `"Deployment"`. It fires exactly 1 search query when typing pauses.

### Protected Routing
In `frontend/src/routes/ProtectedRoute.jsx`:
- Checks `isAuthenticated` from `AuthContext`.
- If true, renders child page (`DashboardPage`, `TasksPage`).
- If false, uses `<Navigate to="/login" state={{ from: location }} replace />` to redirect the user to login while remembering where they wanted to go!

---

## 5. Security Checklist & Answers

| Threat / Vulnerability | How TaskFlow Mitigates It |
|---|---|
| **Insecure Direct Object Reference (IDOR)** | Server-side Laravel Policies (`$this->authorize()`) on every model mutation. Frontend hiding is UX only; backend policies are the security boundary. |
| **SQL Injection** | Strict Eloquent ORM and PDO prepared statements with bounded parameters across all queries. |
| **Cross-Site Scripting (XSS)** | React automatically escapes variables in JSX. Response JSON is strictly typed. |
| **Cross-Site Request Forgery (CSRF)** | API authentication uses Bearer tokens in headers (not vulnerable to automatic browser cookie attachment). |
| **Rate Limiting** | Rate limiters configured in Laravel router (`throttle:10,1` on auth endpoints). |
| **Sensitive Data Exposure** | `User::$hidden = ['password', 'remember_token']`, `APP_DEBUG=false` in production, centralized JSON error handling without stack traces. |

---

## 6. Top 7 Interview Questions & Model Answers

### Q1: "Why did you choose Sanctum tokens instead of JWT?"
> *"I chose Laravel Sanctum because it offers immediate token revocation out of the box. With stateless JWTs, invalidating a token on logout requires implementing token blacklists in Redis, adding distributed state complexity. Sanctum stores hashed tokens in the database, allowing instant revocation (`$user->currentAccessToken()->delete()`) while keeping the architecture lean and explainable."*

### Q2: "How did you prevent N+1 queries when listing tasks?"
> *"For regular users, tasks are retrieved with a single query scoped to `user_id`. When an administrator views tasks across all users, I explicitly eager-load owner details using `with('user:id,name,email')` and only select the specific projection columns needed, reducing memory usage and preventing N+1 SELECT queries."*

### Q3: "How does the AI task assistant work, and what happens if Gemini is down?"
> *"The AI assistant is isolated to the backend (`AiTaskSuggestionService`). When a user inputs a title and description, the service calls Google Gemini 1.5 Flash with a structured JSON schema, a 3.5-second timeout, and 1 retry. If the API key is not configured, or if the API times out or fails, the service transparently switches to a deterministic heuristic engine that classifies the task using keyword heuristics. Normal task creation is never blocked."*

### Q4: "What is your pagination strategy and why?"
> *"I implemented offset pagination with length-aware metadata (`current_page`, `last_page`, `total`, `per_page`). For a task manager, users need direct random-access jump navigation ('Page 2 of 4') and total count visibility. Because our composite B-Tree indexes satisfy both the WHERE filters and the ORDER BY clause, queries execute in under 0.1 ms."*

### Q5: "How does the audit logging system work?"
> *"We have an append-only `audit_logs` table without an `updated_at` column. It records actor ID, action type, target entity, IP address, user agent, and an immutable JSON metadata delta of modified attributes. When an admin updates or deletes a task belonging to another user, or when a user logs in or registers, the event is permanently recorded for security auditing."*

### Q6: "Why did you use React Context instead of Redux?"
> *"TaskFlow's global state is focused on authentication session and notification toasts. Introducing Redux Toolkit would add unnecessary boilerplate (actions, reducers, store slices) for a state that changes infrequently. Native React `AuthContext` with custom hooks provides clean, maintainable state management without bloated dependencies."*

### Q7: "If this application had to scale to 5 million tasks, what would you change?"
> *"1. Switch from offset pagination to keyset/cursor pagination (`WHERE id < cursor`) to maintain O(1) performance on deep pages.*  
> *2. Offload the single-query dashboard counts to Redis cache with event-driven cache invalidation on task creation/completion.*  
> *3. Implement database read replicas using Laravel's native read/write connection configuration.*  
> *4. Push AI suggestions and email notifications to background queues running via Laravel Horizon and Redis."*
