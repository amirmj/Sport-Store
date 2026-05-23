# Sport-Store | Online Sports Store

![Java](https://img.shields.io/badge/Java-21-%23ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4.0.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Thymeleaf](https://img.shields.io/badge/Thymeleaf-005F0F?style=for-the-badge&logo=thymeleaf&logoColor=white)

![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

![Flyway](https://img.shields.io/badge/Flyway-Migration-CC0000?style=for-the-badge&logo=flyway&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)


<br>

**A modern online sports equipment store built with Spring Boot 4 and Java 21.**

---

## 📋 About the Project

**Sport-Store** is a full-featured e-commerce demo website specialized in sports products. It includes a complete
backend and a clean frontend using Thymeleaf.

The project demonstrates professional backend development skills with modern technologies and best practices.

---

### ✨ Key Features

- **Advanced Product Search** (by name, category, brand, price)
- Secure user registration and login with **JWT**
- Dynamic shopping cart
- Online payment integration with **Stripe**
- Order history and tracking
- Admin panel for product and order management
- Responsive design with Thymeleaf templates

---

## 🛠️ Technologies

- **Backend**: Spring Boot 4.0.2, Spring Data JPA, Spring Security
- **Language**: Java 21
- **Database**: MySQL + Flyway (Migrations)
- **Security**: JWT Authentication
- **Payment**: Stripe
- **Frontend**: Thymeleaf
- **Mapping**: MapStruct
- **Documentation**: Swagger UI (OpenAPI)
- **Build Tool**: Maven

---

## 🚀 Quick Start

### Prerequisites

- JDK 21
- Maven 3.9+
- MySQL 8

### Installation

```bash
git clone https://github.com/yourusername/sport-store.git
cd sport-store

# Configure application.yml (database, JWT, Stripe keys)
mvn flyway:migrate
mvn spring-boot:run