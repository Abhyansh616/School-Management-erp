erDiagram

    USER {
        ObjectId _id PK
        string name
        string email
        string password
        string role
        boolean isActive
        date createdAt
        date updatedAt
    }

    STUDENT {
        ObjectId _id PK
        ObjectId userId FK
        string rollNumber
        number enrollmentYear
        string department
        number semester
        boolean isActive
        date createdAt
        date updatedAt
    }

    COURSE {
        ObjectId _id PK
        string title
        string description
        ObjectId teacherId FK
        boolean isActive
        date createdAt
        date updatedAt
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId courseId FK
        date date
        string status
        date createdAt
        date updatedAt
    }

    GRADE {
        ObjectId _id PK
        ObjectId studentId FK
        ObjectId courseId FK
        string examName
        number score
        string remarks
        date createdAt
        date updatedAt
    }

    ANNOUNCEMENT {
        ObjectId _id PK
        string title
        string message
        ObjectId createdBy FK
        boolean isPublished
        date publishedAt
        date createdAt
        date updatedAt
    }

    USER ||--o| STUDENT : "has profile"

    USER ||--o{ COURSE : "teaches"

    STUDENT }o--o{ COURSE : "enrolled in"

    STUDENT ||--o{ ATTENDANCE : "has"

    COURSE ||--o{ ATTENDANCE : "records"

    STUDENT ||--o{ GRADE : "receives"

    COURSE ||--o{ GRADE : "contains"

    USER ||--o{ ANNOUNCEMENT : "creates"