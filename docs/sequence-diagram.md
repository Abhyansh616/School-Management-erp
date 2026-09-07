sequenceDiagram

    actor Admin as Admin Browser
    participant Server as Express Server
    participant Parser as CSV Parser
    participant DB as MongoDB
    participant Socket as Socket.IO
    actor Client as Admin UI

    Admin->>Server: POST /api/upload/students
    Note over Admin,Server: CSV file + JWT + Socket ID

    Server->>Parser: Read uploaded CSV

    Parser-->>Server: Parsed student rows

    Server->>Socket: Emit bulk-upload-start
    Socket-->>Client: Display upload started

    loop For each student row
        Server->>Server: Validate row

        Server->>DB: Check email and roll number

        DB-->>Server: Existing / not existing

        alt Valid and unique student
            Server->>DB: Create User
            DB-->>Server: User created

            Server->>DB: Create Student
            DB-->>Server: Student created

            Server->>Socket: Emit progress
            Socket-->>Client: Update progress bar
        else Invalid or duplicate row
            Server->>Server: Mark row as skipped
            Server->>Socket: Emit progress
            Socket-->>Client: Update skipped count
        end
    end

    Server->>Socket: Emit bulk-upload-complete
    Socket-->>Client: Display final results

    Server-->>Admin: HTTP 200 response