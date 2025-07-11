# Fottg - Free Online Timetable Generator

<p align="center">
    <img src="images/FOTTG.png" alt="Fottg Logo" width="200"/>
</p>


## Overview

**Fottg** (pronounced “fodge”) is a free, open-source timetable generator designed for schools and educational institutions. It provides an API and a frontend for managing and generating complex timetables with ease.


## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Tree](#project-tree)
- [Features](#features)
- [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
- [Usage Guide](#usage-guide)
    - [API Reference](#api-reference)
- [Contributing](#contributing)
- [License](#license)


## Tech Stack

![image](https://img.shields.io/badge/GIT-E44C30?style=for-the-badge&logo=git&logoColor=white)
![image](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)
![image](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)

**Backend:**

![image](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![image](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white)

**Frontend:**

![image](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![image](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)
![image](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![image](https://img.shields.io/badge/Vitest-%236E9F18?style=for-the-badge&logo=Vitest&logoColor=%23fcd703)


## Project Tree
```
.
├── images
├── src
│   ├── backend         
│   │   └── src                     # files required to build the Docker image                      
│   │   │   └── api_endpoints       # all api endpoints 
│   │   │   └── utils               # utility functions
│   │   ├── requirements.txt
│   │   ├── .dockerignore
│   │   └── Dockerfile
│   └── frontend
│       ├── public                  # Static files
│       │   └── img
│       ├── src
│       │   ├── components          # React components / UI
│       │   ├── pages               # React pages
│       │   ├── App.tsx
│       │   ├── index.css
│       │   └── main.tsx
│       ├── tests                   # Test files
│       ├── index.html
│       ├── package.json
│       ├── .dockerignore
│       └── Dockerfile
├── .gitignore
├── .env
├── docker-compose.yaml
├── LICENSE
└── README.md
```


## Features

- API for timetable management
- User authentication
- Flexible school, teacher, and subject configuration
- Advanced scheduling options (block scheduling, parallel limits, etc.)
- Dockerized deployment for easy setup
- User-friendly frontend
- WCAG accessibility has been considered
- Page supports keyboard navigation (Tip: Press <kbd>Shift</kbd> + <kbd>Esc</kbd> to jump to top)
- Export generated timetable as PDF


## Getting Started

### Prerequisites

- **Docker**


### Installation

#### Running Docker Containers

1. **Clone the repository**
    ```bash
    git clone https://github.com/moritz-dstl/timetable
    cd timetable
    ```

2. **Configure environment variables**

    Create a `.env` file:
    ```ini
    # Database configuration
    DB_USER=root
    DB_PASSWORD=DB_PASSWORD

    # Secret key used for encrypting session
    SECRET_KEY=SECRET_KEY

    # API endpoint for the frontend to communicate with the backend
    VITE_API_ENDPOINT=http://localhost:8000
    ```

3. **Start all containers**
    ```bash
    docker compose --env-file .env up -d --build
    ```

    For development, to automatically synchronize changes:
    ```bash
    docker compose --env-file .env watch
    ```

- Access API via [http://localhost:8000](http://localhost:8000)
- Access frontend via [http://localhost:3000](http://localhost:3000)


## Usage Guide

### API Reference

---
<details style="border-radius: 6px;">
<summary><strong>User</strong></summary>

- **Register:**  
    `POST /User/register`  
    ```json
    { "email": "example@email.com", "password": "password123", "school_name": "ABC School" }
    ```

- **Login:**  
    `POST /User/login`  
    ```json
    { "email": "example@email.com", "password": "password123" }
    ```

- **Logout:**  
    `POST /User/logout`

- **Get School Name:**  
    `GET /User/get_school`  
    Returns:  
    ```json
    {"school_name": "ABC School"}
    ```
</details>

---

<details>
<summary><strong>Settings</strong></summary>

- **Set Settings:**  
    `POST /Settings/set`  
    Provide a JSON object with keys for `settings`, `school`, `teachers`, `class_allocations`, etc.
    
    ---
    
    <details>
    <summary>Keys</summary>

    **`settings`:** General configuration for the timetable generator

    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `prefer_early_hours`      | `bool`   | whether earlier periods should be preferred                          |
    | `allow_block_scheduling`  | `bool`   | whether double lessons (blocks) are allowed                          |
    | `max_hours_per_day`       | `int`    | maximum number of hours a subject can appear per day                 |
    | `global_break`            | `int`    | timeslot where a break globaly must occure                           |
    | `weight_block_scheduling` | `int`    | weighting factor for encouraging block scheduling                    |
    | `weight_time_of_hours`    | `int`    | weighting factor for the preference of early or late hours           |
    | `max_time_for_solving`    | `int`    | maximum solving time in seconds for the timetable algorithm          |
        
    <br/>

    **`school`:** Structure of the school

    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `classes`                 | `list`   | e.g. ["C1", "C2", "C3"]                                              |
    | `subjects`                | `list`   | e.g. ["Math", "English", "Physics"]                                  |
    | `hours_per_day`           | `int`    | number of periods per day                                            |
        
    <br/>

    **`teachers`:** List of teachers where each teacher object includes:

    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `name`                    | `string` | full name of the teacher                                             |
    | `max_hours`               | `int`    | maximum weekly teaching load                                         |
    | `subjects`                | `list`   | list of subjects the teacher can teach                               |
    
    <br/>

    **`class_allocations`:** List of subjects assigned to each class, including:

    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `class_name`              | `string` |                                                                      |
    | `subject`                 | `string` | name of subject                                                      |
    | `hours_per_week`          | `int`    | amount of hours subject has to be teached per week                   |
        
    <br/>

    **`subject_parallel_limits`:** Optional list of subjects that cannot be taught in too many classes at once (e.g. due to room constraints)
        
    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `subject_name`            | `string` |                                                                      |
    | `max_parallel`            | `int`    | max simultaneous occurrences                                         |
        
    <br/>

    **`prefer_block_subjects`:** Optional list of subjects that strongly prefer to be scheduled in double periods
        
    |             Key           |   Type   |                             Description                              |
    |---------------------------|----------|----------------------------------------------------------------------|
    | `subject_name`            | `string` |                                                                      |
    | `weight`                  | `int`    | Numeric weight (should be set **higher than 10**. A value above 50 will almost always ensure the subject is scheduled as a block)|

    </details>

    ---

    <details>
    <summary>Example</summary>

    ```json
    {
        "settings": {
            "prefer_early_hours": true,
            "allow_block_scheduling": true,
            "max_hours_per_day": 2,
            "global_break": 7,
            "weight_block_scheduling": 10,
            "weight_time_of_hours": 10,
            "max_time_for_solving": 180
        },
        "school": {
            "classes": ["C1", "C2", "C3"],
            "subjects": ["Math", "German", "English", "PE", "Biology", "Chemistry", "Physics", "History"],
            "hours_per_day": 8
        },
        "teachers": [
            { "name": "Smith", "max_hours": 20, "subjects": ["Math", "Physics"] }
        ],
        "class_allocations": [
            { "class_name": "C1", "subject": "Math", "hours_per_week": 4 }
        ],
        "subject_parallel_limits": [
            { "subject_name": "PE", "max_parallel": 2 }
        ],
        "prefer_block_subjects": [
            { "subject_name": "PE", "weight": 60 }
        ]
    }
    ```

    </details>

    ---

- **Get Settings:**  
    `GET /Settings/get`  
    Returns the current configuration.
    
    ---
    
    <details>
    <summary><strong>Example</strong></summary>

    ```json
        {
            "classes": [
                {
                    "class_name": "C1",
                    "hours_per_week": 4,
                    "subject": "Math"
                },
                {
                    "class_name": "C1",
                    "hours_per_week": 3,
                    "subject": "English"
                },
                {
                    "class_name": "C2",
                    "hours_per_week": 4,
                    "subject": "Math"
                },
                {
                    "class_name": "C2",
                    "hours_per_week": 3,
                    "subject": "PE"
                },
                {
                    "class_name": "C3",
                    "hours_per_week": 4,
                    "subject": "Math"
                },
                {
                    "class_name": "C3",
                    "hours_per_week": 3,
                    "subject": "German"
                }
            ],
            "prefer_block_subjects": [
                {
                    "subject_name": "PE",
                    "weight": 60
                }
            ],
            "school": {
                "Uid": 1,
                "classes": "['C1', 'C2', 'C3']",
                "hours_per_day": 8,
                "subjects": "['Math', 'German', 'English', 'PE']"
            },
            "settings": {
                "Uid": 1,
                "allow_block_scheduling": 1,
                "global_break": 6,
                "max_hours_per_day": 2,
                "max_time_for_solving": 180,
                "prefer_early_hours": 1,
                "weight_block_scheduling": 10,
                "weight_time_of_hours": 10
            },
            "subject_parallel_limits": [
                {
                    "max_parallel": 2,
                    "subject_name": "PE"
                }
            ],
            "teacher_subjects": [
                {
                    "Tid": 26,
                    "subject": "Math"
                },
                {
                    "Tid": 27,
                    "subject": "German"
                },
                {
                    "Tid": 28,
                    "subject": "English"
                },
                {
                    "Tid": 29,
                    "subject": "PE"
                },
            ],
            "teachers": [
                {
                    "Tid": 26,
                    "max_hours": 20,
                    "name": "Smith"
                },
                {
                    "Tid": 27,
                    "max_hours": 20,
                    "name": "Johnson"
                },
                {
                    "Tid": 28,
                    "max_hours": 18,
                    "name": "Williams"
                },
                {
                    "Tid": 29,
                    "max_hours": 18,
                    "name": "Brown"
                }
            ]
        }
    ```

    </details>

    ---

</details>

---

<details>
<summary><strong>Timetable Computation</strong></summary>

- **Start Computation:**  
    `GET /start_computing`  
    Returns a job ID.
    ```json
    {
        "job_id": "24de5582-1b57-42dc-b5a3-bd2c4366806b",
        "status": "started"
    }
    ````

- **Check Status:**  
    `GET /status/<job_id>`  
    Returns computation status and, when finished, the generated timetable.

    ---

    <details>
    <summary>Example</summary>

    ```json
    {
        "status": "finished",
        "result": {
            "status": "success",
            "classes": {
                "C1": {
                    "Mo": ["Subject (Teacher)", "Subject (Teacher)", "free", "..."],
                    "Tu": ["...", "..."]
                }
            },
            "teachers": {
                "Smith": {
                    "Mo": ["Subject (C1)", "Subject (C2)", "free", "..."]
                }
            }
        }
    }
    ```

    </details>

    ---

</details>

---

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.


## License

This project is licensed under the [MIT License](LICENSE).
