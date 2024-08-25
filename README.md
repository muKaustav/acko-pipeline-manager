<h1 align="center">Acko Pipeline Manager 🛠️</h1>

## 📚 Problem Statement

Develop a data platform that allows users to create and manage data pipelines from multiple sources using a UI interface. The platform should provide an overview of existing pipelines, allow users to create new pipelines, and manage existing ones. The pipelines should be able to process data from various sources and load it into a destination.

### Requirements:

- Dashboard displaying an overview of existing pipelines
- Pipeline creation page
- Pipeline management page
- Backend API for pipeline operations
- Pipeline processing logic for extract and load operations

### Bonus Points:

- Real-time pipeline status updates using WebSockets
- Integration with a real database for source or destination
- Using open-source pipeline tools like singer.io for ELT

## 💡 Design Assumptions & Limitations
### Assumptions:
- Have assumed the application user is using MySQL or PostgreSQL as source or destination databases.
- Have assumed there is no processing at the transformation level. (EL)
- Have assumed EL processing is at Database level.
- Have assumed EL processing is done using Meltano / Singer.io.

### Limitations:
- Reliance on Meltano / Singer.io.
- Single Container Setup for all the services, hence single points of failure and scalability issues.
- No user authentication or role-based access control.
- Currently only one pipeline can be processed at a time, which can be increased through the configuration, taking into account the system resources.
- Vite can be used over Create React App for better performance.



## 🎯 Features Implemented

### Frontend:

- Dashboard with pipeline overview
- Pipeline creation page
- Pipeline management page
- Search bar for quick pipeline lookup

### Backend:

- MySQL and PostgreSQL support for source and destination
- MongoDB for pipeline metadata storage
- RESTful API for pipeline operations
- WebSockets for real-time pipeline status updates
- Offloaded processing using BullMQ, using Redis as a broker, for extract and load operations
- Caching using Redis for faster data retrieval
- Used Meltano / Singer.io for ELT operations

## 🌐 Tech Stack

- Frontend: React (Create React App)
- Backend: Node.js
- Database: MongoDB, MySQL, PostgreSQL
- Styling: TailwindCSS
- Caching: Redis
- Containerization: Docker

## 📝 System Design

<p align = center>
    <img alt="Project Logo" src="https://raw.githubusercontent.com/muKaustav/acko-pipeline-manager/main/assets/arch.png" target="_blank" />
</p>

## 🚀 Getting Started

### Prerequisites

- Docker
- Docker Compose

### Installation

1. Clone the repository:

   ```
   git clone https://github.com/muKaustav/acko-pipeline-manager.git
   ```

2. Navigate to the project directory:

   ```
   cd acko-pipeline-manager
   ```

3. Start the application:

   ```
   sudo docker compose up --build
   ```

4. Access the web interface at `http://localhost:3000`

## 📈 Future Improvements

1. Implement multiple containers for better load distribution.
2. Implement load balancing using Nginx to distribute traffic across multiple servers.
3. Utilize managed load balancing solutions like AWS ELB for scalability.
4. Integrate Apache Airflow for advanced scheduling capabilities.
5. Set up a distributed cache for improved performance.
6. Replace Create React App with a more optimized build tool. (e.g., Vite or Next.js)
7. Implement user authentication and role-based access control.

## 👨‍💻 Author

Your Name

- GitHub: [@muKaustav](https://github.com/muKaustav)
- LinkedIn: [kaustavmukhopadhyay](https://www.linkedin.com/in/kaustavmukhopadhyay/)

---
