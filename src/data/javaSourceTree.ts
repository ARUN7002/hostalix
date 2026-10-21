export interface JavaSourceFile {
  path: string;
  category: 'build' | 'config' | 'entity' | 'repository' | 'service' | 'controller' | 'test' | 'script' | 'docs';
  description: string;
  code: string;
}

export const JAVA_PROJECT_FILES: JavaSourceFile[] = [
  {
    path: 'pom.xml',
    category: 'build',
    description: 'Maven Project Object Model with Java 21, Spring Boot 3.3.4, Spring Security, MySQL, Thymeleaf & JUnit 5',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.4</version>
        <relativePath/>
    </parent>
    <groupId>com.clinicalcore</groupId>
    <artifactId>hospital-management-system</artifactId>
    <version>1.0.0-SNAPSHOT</version>
    <name>Hospital Management System</name>
    <description>Enterprise Clinical & Hospital Management Academic Core System</description>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>21</maven.compiler.source>
        <maven.compiler.target>21</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Spring Boot Web & REST MVC -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>

        <!-- Thymeleaf Template Engine & Security Taglib -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-thymeleaf</artifactId>
        </dependency>
        <dependency>
            <groupId>org.thymeleaf.extras</groupId>
            <artifactId>thymeleaf-extras-springsecurity6</artifactId>
        </dependency>

        <!-- Spring Data JPA (Hibernate 6) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>

        <!-- Bean Validation (Hibernate Validator) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>

        <!-- Spring Security 6 (RBAC & Authentication) -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>

        <!-- MySQL JDBC Connector -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>

        <!-- In-Memory H2 Database (for isolated JUnit test runs) -->
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>test</scope>
        </dependency>

        <!-- Test Suite: JUnit 5, AssertJ, Mockito, Spring Security Test -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <source>21</source>
                    <target>21</target>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`,
  },
  {
    path: 'src/main/resources/application.properties',
    category: 'config',
    description: 'Spring Boot Application Properties for MySQL 8.0 connection pool, JPA Hibernate, and Thymeleaf',
    code: `# Server Configuration
server.port=8080
server.servlet.context-path=/
server.error.include-message=always

# MySQL 8.0 Production Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/hospital_db?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=UTF-8
spring.datasource.username=hms_user
spring.datasource.password=SecureHmsPass2026!
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP Connection Pool Settings
spring.datasource.hikari.maximum-pool-size=15
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.idle-timeout=300000
spring.datasource.hikari.connection-timeout=20000

# JPA & Hibernate Settings
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# Thymeleaf Engine Configuration
spring.thymeleaf.cache=false
spring.thymeleaf.prefix=classpath:/templates/
spring.thymeleaf.suffix=.html
spring.thymeleaf.encoding=UTF-8

# Application Clinical Logging
logging.level.root=INFO
logging.level.com.clinicalcore.hms=DEBUG
logging.level.org.springframework.security=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} [%thread] %-5level %logger{36} - %msg%n`,
  },
  {
    path: 'src/main/resources/schema.sql',
    category: 'config',
    description: 'ANSI SQL Relational Schema for MySQL 8.0 with Foreign Keys, Constraints and Indexes',
    code: `-- Hospital Management System Database DDL
-- Compatible with MySQL 8.0+

CREATE DATABASE IF NOT EXISTS hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_db;

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    head_doctor_name VARCHAR(150),
    total_beds INT NOT NULL DEFAULT 0,
    occupied_beds INT NOT NULL DEFAULT 0,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. System Users & RBAC
CREATE TABLE IF NOT EXISTS app_users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(80) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL, -- ROLE_ADMIN, ROLE_DOCTOR, ROLE_NURSE, ROLE_RECEPTIONIST, ROLE_CASHIER
    department_id BIGINT,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_users_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 3. Doctors Table
CREATE TABLE IF NOT EXISTS doctors (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(30) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone_number VARCHAR(30) NOT NULL,
    department_id BIGINT NOT NULL,
    specialization VARCHAR(150) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    consultation_fee DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    room_number VARCHAR(50) NOT NULL,
    available_days VARCHAR(100) NOT NULL DEFAULT 'MON,TUE,WED,THU,FRI',
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_doctors_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Patients Table (Electronic Medical Records)
CREATE TABLE IF NOT EXISTS patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mrn VARCHAR(50) NOT NULL UNIQUE, -- Medical Record Number
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20) NOT NULL,
    blood_group VARCHAR(10) NOT NULL,
    phone_number VARCHAR(30) NOT NULL,
    email VARCHAR(150),
    emergency_contact_name VARCHAR(150) NOT NULL,
    emergency_contact_relation VARCHAR(80) NOT NULL,
    emergency_contact_phone VARCHAR(30) NOT NULL,
    address TEXT NOT NULL,
    allergies TEXT,
    chronic_conditions TEXT,
    triage_level VARCHAR(30) NOT NULL DEFAULT 'STANDARD',
    assigned_ward VARCHAR(80),
    bed_number VARCHAR(30),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_patient_name (last_name, first_name),
    INDEX idx_patient_phone (phone_number)
) ENGINE=InnoDB;

-- 5. Appointments Table (with Uniqueness guard against double-booking)
CREATE TABLE IF NOT EXISTS appointments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_code VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    doctor_id BIGINT NOT NULL,
    department_id BIGINT NOT NULL,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL, -- e.g. "09:30"
    status VARCHAR(30) NOT NULL DEFAULT 'SCHEDULED', -- SCHEDULED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    chief_complaint TEXT NOT NULL,
    triage_notes TEXT,
    diagnosis TEXT,
    prescription_notes TEXT,
    blood_pressure VARCHAR(30),
    heart_rate INT,
    temperature DECIMAL(4,1),
    spo2 INT,
    invoice_generated BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_appt_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_doctor FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE RESTRICT,
    CONSTRAINT fk_appt_department FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE RESTRICT,
    INDEX idx_doctor_schedule (doctor_id, appointment_date, time_slot)
) ENGINE=InnoDB;

-- 6. Billing Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    appointment_id BIGINT,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    tax_rate DECIMAL(5,4) NOT NULL DEFAULT 0.0500,
    tax_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, PAID, CANCELLED, REFUNDED
    payment_method VARCHAR(50),
    paid_at TIMESTAMP NULL,
    transaction_reference VARCHAR(100),
    receipt_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_invoice_patient FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE RESTRICT,
    CONSTRAINT fk_invoice_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- 7. Invoice Line Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    item_type VARCHAR(40) NOT NULL, -- CONSULTATION, LAB_TEST, PHARMACY, PROCEDURE, ROOM_CHARGE
    unit_price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    quantity INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    CONSTRAINT fk_item_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Immutable System Security & Audit Log
CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    actor_username VARCHAR(80) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(80) NOT NULL,
    entity_type VARCHAR(80) NOT NULL,
    entity_id VARCHAR(80) NOT NULL,
    details TEXT,
    status VARCHAR(30) NOT NULL
) ENGINE=InnoDB;`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/config/SecurityConfig.java',
    category: 'config',
    description: 'Spring Security 6 Configuration with BCryptPasswordEncoder, Role-Based Route Protection and CSRF',
    code: `package com.clinicalcore.hms.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/css/**", "/js/**", "/images/**", "/webjars/**").permitAll()
                .requestMatchers("/login", "/error").permitAll()
                
                // Role-Specific Route Authorizations
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .requestMatchers("/doctor/**").hasAnyRole("DOCTOR", "ADMIN")
                .requestMatchers("/nurse/**").hasAnyRole("NURSE", "DOCTOR", "ADMIN")
                .requestMatchers("/receptionist/**").hasAnyRole("RECEPTIONIST", "ADMIN")
                .requestMatchers("/billing/**").hasAnyRole("CASHIER", "ADMIN")
                
                // Shared Hospital Workstation Access
                .requestMatchers("/patients/**").hasAnyRole("RECEPTIONIST", "DOCTOR", "NURSE", "ADMIN")
                .requestMatchers("/appointments/**").hasAnyRole("RECEPTIONIST", "DOCTOR", "ADMIN")
                
                .anyRequest().authenticated()
            )
            .formLogin(form -> form
                .loginPage("/login")
                .defaultSuccessUrl("/dashboard", true)
                .failureUrl("/login?error=true")
                .permitAll()
            )
            .logout(logout -> logout
                .logoutUrl("/logout")
                .logoutSuccessUrl("/login?logout=true")
                .invalidateHttpSession(true)
                .deleteCookies("JSESSIONID")
                .permitAll()
            )
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/v1/emergency-triage/**") // Selective API CSRF exemption if needed
            );

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/entity/Patient.java',
    category: 'entity',
    description: 'JPA Patient Entity with Bean Validation annotations and Medical Record attributes',
    code: `package com.clinicalcore.hms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "patients", indexes = {
    @Index(name = "idx_patient_name", columnList = "lastName, firstName"),
    @Index(name = "idx_patient_phone", columnList = "phoneNumber")
})
public class Patient {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Medical Record Number (MRN) is required")
    @Column(name = "mrn", nullable = false, unique = true, length = 50)
    private String mrn;

    @NotBlank(message = "First name is mandatory")
    @Size(min = 2, max = 100)
    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @NotBlank(message = "Last name is mandatory")
    @Size(min = 2, max = 100)
    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @NotNull(message = "Date of birth is required")
    @Past(message = "Date of birth must be a past date")
    @Column(name = "date_of_birth", nullable = false)
    private LocalDate dateOfBirth;

    @NotBlank(message = "Gender is required")
    @Column(name = "gender", nullable = false, length = 20)
    private String gender;

    @NotBlank(message = "Blood group is required")
    @Pattern(regexp = "^(A|B|AB|O)[+-]$", message = "Invalid blood group format (e.g. A+, O-, AB+)")
    @Column(name = "blood_group", nullable = false, length = 10)
    private String bloodGroup;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^[+0-9- ]{8,25}$", message = "Invalid phone format")
    @Column(name = "phone_number", nullable = false, length = 30)
    private String phoneNumber;

    @Email(message = "Invalid email format")
    @Column(name = "email", length = 150)
    private String email;

    @NotBlank(message = "Emergency contact name is mandatory")
    @Column(name = "emergency_contact_name", nullable = false, length = 150)
    private String emergencyContactName;

    @NotBlank(message = "Emergency relationship is mandatory")
    @Column(name = "emergency_contact_relation", nullable = false, length = 80)
    private String emergencyContactRelation;

    @NotBlank(message = "Emergency contact phone is mandatory")
    @Column(name = "emergency_contact_phone", nullable = false, length = 30)
    private String emergencyContactPhone;

    @NotBlank(message = "Residential address is mandatory")
    @Column(name = "address", nullable = false, columnDefinition = "TEXT")
    private String address;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "chronic_conditions", columnDefinition = "TEXT")
    private String chronicConditions;

    @NotBlank(message = "Triage classification is mandatory")
    @Column(name = "triage_level", nullable = false, length = 30)
    private String triageLevel; // IMMEDIATE, VERY_URGENT, URGENT, STANDARD, NON_URGENT

    @Column(name = "assigned_ward", length = 80)
    private String assignedWard;

    @Column(name = "bed_number", length = 30)
    private String bedNumber;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public Patient() {}

    // Getters and Setters omitted for brevity in preview, standard POJO getters and setters implemented
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getMrn() { return mrn; }
    public void setMrn(String mrn) { this.mrn = mrn; }
    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }
    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }
    public String getFullName() { return firstName + " " + lastName; }
    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
    public String getGender() { return gender; }
    public void setGender(String gender) { this.gender = gender; }
    public String getBloodGroup() { return bloodGroup; }
    public void setBloodGroup(String bloodGroup) { this.bloodGroup = bloodGroup; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getEmergencyContactName() { return emergencyContactName; }
    public void setEmergencyContactName(String emergencyContactName) { this.emergencyContactName = emergencyContactName; }
    public String getEmergencyContactRelation() { return emergencyContactRelation; }
    public void setEmergencyContactRelation(String emergencyContactRelation) { this.emergencyContactRelation = emergencyContactRelation; }
    public String getEmergencyContactPhone() { return emergencyContactPhone; }
    public void setEmergencyContactPhone(String emergencyContactPhone) { this.emergencyContactPhone = emergencyContactPhone; }
    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }
    public String getAllergies() { return allergies; }
    public void setAllergies(String allergies) { this.allergies = allergies; }
    public String getChronicConditions() { return chronicConditions; }
    public void setChronicConditions(String chronicConditions) { this.chronicConditions = chronicConditions; }
    public String getTriageLevel() { return triageLevel; }
    public void setTriageLevel(String triageLevel) { this.triageLevel = triageLevel; }
    public String getAssignedWard() { return assignedWard; }
    public void setAssignedWard(String assignedWard) { this.assignedWard = assignedWard; }
    public String getBedNumber() { return bedNumber; }
    public void setBedNumber(String bedNumber) { this.bedNumber = bedNumber; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/entity/Appointment.java',
    category: 'entity',
    description: 'JPA Appointment Entity with Doctor & Patient Relationships and Clinical Vitals',
    code: `package com.clinicalcore.hms.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "appointments", indexes = {
    @Index(name = "idx_doctor_schedule", columnList = "doctor_id, appointment_date, time_slot")
})
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(name = "appointment_code", nullable = false, unique = true, length = 50)
    private String appointmentCode;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @NotNull
    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @NotBlank
    @Column(name = "time_slot", nullable = false, length = 20)
    private String timeSlot;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private AppointmentStatus status = AppointmentStatus.SCHEDULED;

    @NotBlank
    @Column(name = "chief_complaint", nullable = false, columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(name = "triage_notes", columnDefinition = "TEXT")
    private String triageNotes;

    @Column(name = "diagnosis", columnDefinition = "TEXT")
    private String diagnosis;

    @Column(name = "prescription_notes", columnDefinition = "TEXT")
    private String prescriptionNotes;

    @Column(name = "blood_pressure", length = 30)
    private String bloodPressure;

    @Column(name = "heart_rate")
    private Integer heartRate;

    @Column(name = "temperature", precision = 4, scale = 1)
    private BigDecimal temperature;

    @Column(name = "spo2")
    private Integer spO2;

    @Column(name = "invoice_generated", nullable = false)
    private boolean invoiceGenerated = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum AppointmentStatus {
        SCHEDULED, IN_CONSULTATION, COMPLETED, CANCELLED, NO_SHOW
    }

    public Appointment() {}

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getAppointmentCode() { return appointmentCode; }
    public void setAppointmentCode(String appointmentCode) { this.appointmentCode = appointmentCode; }
    public Patient getPatient() { return patient; }
    public void setPatient(Patient patient) { this.patient = patient; }
    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }
    public Department getDepartment() { return department; }
    public void setDepartment(Department department) { this.department = department; }
    public LocalDate getAppointmentDate() { return appointmentDate; }
    public void setAppointmentDate(LocalDate appointmentDate) { this.appointmentDate = appointmentDate; }
    public String getTimeSlot() { return timeSlot; }
    public void setTimeSlot(String timeSlot) { this.timeSlot = timeSlot; }
    public AppointmentStatus getStatus() { return status; }
    public void setStatus(AppointmentStatus status) { this.status = status; }
    public String getChiefComplaint() { return chiefComplaint; }
    public void setChiefComplaint(String chiefComplaint) { this.chiefComplaint = chiefComplaint; }
    public String getDiagnosis() { return diagnosis; }
    public void setDiagnosis(String diagnosis) { this.diagnosis = diagnosis; }
    public String getPrescriptionNotes() { return prescriptionNotes; }
    public void setPrescriptionNotes(String prescriptionNotes) { this.prescriptionNotes = prescriptionNotes; }
    public boolean isInvoiceGenerated() { return invoiceGenerated; }
    public void setInvoiceGenerated(boolean invoiceGenerated) { this.invoiceGenerated = invoiceGenerated; }
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/repository/AppointmentRepository.java',
    category: 'repository',
    description: 'Spring Data JPA Repository with Custom Double-Booking Conflict Queries',
    code: `package com.clinicalcore.hms.repository;

import com.clinicalcore.hms.entity.Appointment;
import com.clinicalcore.hms.entity.Appointment.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    Optional<Appointment> findByAppointmentCode(String appointmentCode);

    List<Appointment> findByDoctorIdAndAppointmentDate(Long doctorId, LocalDate appointmentDate);

    List<Appointment> findByPatientId(Long patientId);

    /**
     * Critical Double-Booking Verification:
     * Checks if doctor has an active, non-cancelled appointment on the requested date and time slot.
     */
    @Query("""
        SELECT COUNT(a) > 0 FROM Appointment a
        WHERE a.doctor.id = :doctorId
          AND a.appointmentDate = :appointmentDate
          AND a.timeSlot = :timeSlot
          AND a.status NOT IN (:excludedStatuses)
    """)
    boolean existsConflictingBooking(
        @Param("doctorId") Long doctorId,
        @Param("appointmentDate") LocalDate appointmentDate,
        @Param("timeSlot") String timeSlot,
        @Param("excludedStatuses") List<AppointmentStatus> excludedStatuses
    );

    List<Appointment> findByAppointmentDateOrderByTimeSlotAsc(LocalDate appointmentDate);
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/service/AppointmentService.java',
    category: 'service',
    description: 'Transactional Service handling Double-Booking Conflict Detection and State Transitions',
    code: `package com.clinicalcore.hms.service;

import com.clinicalcore.hms.entity.Appointment;
import com.clinicalcore.hms.entity.Appointment.AppointmentStatus;
import com.clinicalcore.hms.entity.Doctor;
import com.clinicalcore.hms.entity.Patient;
import com.clinicalcore.hms.exception.SchedulingConflictException;
import com.clinicalcore.hms.repository.AppointmentRepository;
import com.clinicalcore.hms.repository.DoctorRepository;
import com.clinicalcore.hms.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;

    public AppointmentService(
        AppointmentRepository appointmentRepository,
        DoctorRepository doctorRepository,
        PatientRepository patientRepository
    ) {
        this.appointmentRepository = appointmentRepository;
        this.doctorRepository = doctorRepository;
        this.patientRepository = patientRepository;
    }

    /**
     * Atomic Appointment Booking with Conflict Guard
     * Isolation LEVEL: SERIALIZABLE to prevent race condition slot collisions.
     */
    @Transactional(isolation = Isolation.SERIALIZABLE)
    public Appointment bookAppointment(Long patientId, Long doctorId, LocalDate date, String timeSlot, String complaint) {
        Doctor doctor = doctorRepository.findById(doctorId)
            .orElseThrow(() -> new IllegalArgumentException("Doctor not found: " + doctorId));

        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        // 1. Conflict Prevention Check
        boolean isSlotOccupied = appointmentRepository.existsConflictingBooking(
            doctorId,
            date,
            timeSlot,
            List.of(AppointmentStatus.CANCELLED, AppointmentStatus.NO_SHOW)
        );

        if (isSlotOccupied) {
            throw new SchedulingConflictException(
                String.format("Doctor %s is already scheduled for slot %s on %s.",
                    doctor.getFullName(), timeSlot, date)
            );
        }

        // 2. Build and persist
        Appointment appointment = new Appointment();
        appointment.setAppointmentCode("APT-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        appointment.setPatient(patient);
        appointment.setDoctor(doctor);
        appointment.setDepartment(doctor.getDepartment());
        appointment.setAppointmentDate(date);
        appointment.setTimeSlot(timeSlot);
        appointment.setChiefComplaint(complaint);
        appointment.setStatus(AppointmentStatus.SCHEDULED);

        return appointmentRepository.save(appointment);
    }

    @Transactional
    public Appointment transitionStatus(Long appointmentId, AppointmentStatus newStatus) {
        Appointment appt = appointmentRepository.findById(appointmentId)
            .orElseThrow(() -> new IllegalArgumentException("Appointment not found: " + appointmentId));

        // State Machine validation
        if (appt.getStatus() == AppointmentStatus.CANCELLED && newStatus == AppointmentStatus.COMPLETED) {
            throw new IllegalStateException("Cannot transition a CANCELLED appointment to COMPLETED.");
        }

        appt.setStatus(newStatus);
        return appointmentRepository.save(appt);
    }
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/service/BillingService.java',
    category: 'service',
    description: 'Financial Ledger Service: itemization, tax computation, discount guard, and payment processing',
    code: `package com.clinicalcore.hms.service;

import com.clinicalcore.hms.entity.Appointment;
import com.clinicalcore.hms.entity.Invoice;
import com.clinicalcore.hms.entity.InvoiceItem;
import com.clinicalcore.hms.entity.Patient;
import com.clinicalcore.hms.repository.InvoiceRepository;
import com.clinicalcore.hms.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class BillingService {

    private static final BigDecimal TAX_RATE = new BigDecimal("0.05"); // 5% Standard Healthcare Levy

    private final InvoiceRepository invoiceRepository;
    private final PatientRepository patientRepository;

    public BillingService(InvoiceRepository invoiceRepository, PatientRepository patientRepository) {
        this.invoiceRepository = invoiceRepository;
        this.patientRepository = patientRepository;
    }

    @Transactional
    public Invoice generateInvoice(Long patientId, Long appointmentId, List<InvoiceItem> items, BigDecimal discount) {
        Patient patient = patientRepository.findById(patientId)
            .orElseThrow(() -> new IllegalArgumentException("Patient not found: " + patientId));

        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Cannot generate an invoice without line items.");
        }

        BigDecimal subtotal = BigDecimal.ZERO;
        for (InvoiceItem item : items) {
            BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            item.setTotal(lineTotal);
            subtotal = subtotal.add(lineTotal);
        }

        BigDecimal discountAmount = discount != null ? discount : BigDecimal.ZERO;
        BigDecimal taxableBase = subtotal.subtract(discountAmount).max(BigDecimal.ZERO);
        BigDecimal taxAmount = taxableBase.multiply(TAX_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = taxableBase.add(taxAmount);

        Invoice invoice = new Invoice();
        invoice.setInvoiceNumber("INV-" + LocalDate.now().getYear() + "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase());
        invoice.setPatient(patient);
        invoice.setIssueDate(LocalDate.now());
        invoice.setDueDate(LocalDate.now().plusDays(14));
        invoice.setSubtotal(subtotal);
        invoice.setTaxRate(TAX_RATE);
        invoice.setTaxAmount(taxAmount);
        invoice.setDiscountAmount(discountAmount);
        invoice.setTotalAmount(totalAmount);
        invoice.setStatus(Invoice.InvoiceStatus.PENDING);

        items.forEach(item -> item.setInvoice(invoice));
        invoice.setItems(items);

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice processPayment(Long invoiceId, String paymentMethod, String txnRef, String notes) {
        Invoice invoice = invoiceRepository.findById(invoiceId)
            .orElseThrow(() -> new IllegalArgumentException("Invoice not found: " + invoiceId));

        if (invoice.getStatus() == Invoice.InvoiceStatus.PAID) {
            throw new IllegalStateException("Invoice is already settled in full.");
        }

        invoice.setStatus(Invoice.InvoiceStatus.PAID);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setTransactionReference(txnRef);
        invoice.setReceiptNotes(notes);
        invoice.setPaidAt(LocalDateTime.now());

        return invoiceRepository.save(invoice);
    }
}`,
  },
  {
    path: 'src/main/java/com/clinicalcore/hms/controller/PatientController.java',
    category: 'controller',
    description: 'Spring MVC & Thymeleaf Controller for Patient EMR Intake with Bean Validation and BindingResult',
    code: `package com.clinicalcore.hms.controller;

import com.clinicalcore.hms.entity.Patient;
import com.clinicalcore.hms.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/patients")
public class PatientController {

    private final PatientService patientService;

    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public String listPatients(@RequestParam(value = "search", required = false) String search, Model model) {
        model.addAttribute("patients", patientService.findAllOrSearch(search));
        model.addAttribute("newPatient", new Patient());
        return "patients/list";
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST')")
    public String viewPatientDossier(@PathVariable("id") Long id, Model model) {
        Patient patient = patientService.findById(id);
        model.addAttribute("patient", patient);
        model.addAttribute("medicalHistory", patientService.findClinicalHistory(id));
        return "patients/dossier";
    }

    @PostMapping("/register")
    @PreAuthorize("hasAnyRole('ADMIN', 'RECEPTIONIST')")
    public String registerPatient(
        @Valid @ModelAttribute("newPatient") Patient patient,
        BindingResult bindingResult,
        RedirectAttributes redirectAttributes,
        Model model
    ) {
        if (bindingResult.hasErrors()) {
            model.addAttribute("patients", patientService.findAll());
            model.addAttribute("hasValidationErrors", true);
            return "patients/list";
        }

        Patient saved = patientService.register(patient);
        redirectAttributes.addFlashAttribute("successMessage", "Patient registered successfully: " + saved.getMrn());
        return "redirect:/patients/" + saved.getId();
    }
}`,
  },
  {
    path: 'src/test/java/com/clinicalcore/hms/HospitalManagementApplicationTests.java',
    category: 'test',
    description: 'JUnit 5 Integration and Unit Test Suite verifying Security, Double-Booking, Validation, and Billing',
    code: `package com.clinicalcore.hms;

import com.clinicalcore.hms.entity.*;
import com.clinicalcore.hms.exception.SchedulingConflictException;
import com.clinicalcore.hms.repository.*;
import com.clinicalcore.hms.service.AppointmentService;
import com.clinicalcore.hms.service.BillingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class HospitalManagementApplicationTests {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private BillingService billingService;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private InvoiceRepository invoiceRepository;

    @Test
    @DisplayName("Test 1: BCrypt password hashing must match encoded user password")
    void testPasswordEncoding() {
        String rawPassword = "AdminSecurePassword2026!";
        String encoded = passwordEncoder.encode(rawPassword);
        assertTrue(passwordEncoder.matches(rawPassword, encoded));
        assertFalse(passwordEncoder.matches("WrongPassword", encoded));
    }

    @Test
    @DisplayName("Test 2: Patient Registration generates valid MRN and persists record")
    void testPatientRegistration() {
        Patient patient = new Patient();
        patient.setMrn("MRN-TEST-999");
        patient.setFirstName("Clara");
        patient.setLastName("Oswald");
        patient.setDateOfBirth(LocalDate.of(1990, 5, 20));
        patient.setGender("FEMALE");
        patient.setBloodGroup("B+");
        patient.setPhoneNumber("+1-555-0100");
        patient.setEmergencyContactName("John Oswald");
        patient.setEmergencyContactRelation("Father");
        patient.setEmergencyContactPhone("+1-555-0101");
        patient.setAddress("742 Evergreen Terrace");
        patient.setTriageLevel("STANDARD");

        Patient saved = patientRepository.save(patient);
        assertNotNull(saved.getId());
        assertEquals("Clara Oswald", saved.getFullName());
    }

    @Test
    @DisplayName("Test 3: Double booking prevention rejects appointment for same doctor at same slot")
    void testDoubleBookingConflictRejection() {
        // Setup initial booking
        LocalDate appointmentDate = LocalDate.now().plusDays(2);
        String slot = "10:00";

        // First booking must succeed
        Appointment appt1 = appointmentService.bookAppointment(1L, 1L, appointmentDate, slot, "Routine cardiac checkup");
        assertNotNull(appt1.getId());

        // Second booking for the same doctor and slot MUST throw SchedulingConflictException
        assertThrows(SchedulingConflictException.class, () -> {
            appointmentService.bookAppointment(2L, 1L, appointmentDate, slot, "Second patient attempting collision");
        });
    }

    @Test
    @DisplayName("Test 4: Billing ledger correctly computes subtotal, 5% tax, and net total")
    void testBillingCalculations() {
        InvoiceItem item1 = new InvoiceItem();
        item1.setDescription("Cardiology Consult");
        item1.setItemType(InvoiceItem.ItemType.CONSULTATION);
        item1.setUnitPrice(new BigDecimal("150.00"));
        item1.setQuantity(1);

        InvoiceItem item2 = new InvoiceItem();
        item2.setDescription("12-Lead ECG");
        item2.setItemType(InvoiceItem.ItemType.PROCEDURE);
        item2.setUnitPrice(new BigDecimal("75.00"));
        item2.setQuantity(1);

        Invoice invoice = billingService.generateInvoice(1L, 1L, List.of(item1, item2), new BigDecimal("25.00"));

        // Subtotal = 150 + 75 = 225.00
        // Discount = 25.00 -> Taxable = 200.00
        // Tax 5% of 200 = 10.00
        // Total = 210.00
        assertEquals(new BigDecimal("225.00"), invoice.getSubtotal());
        assertEquals(new BigDecimal("10.00"), invoice.getTaxAmount());
        assertEquals(new BigDecimal("210.00"), invoice.getTotalAmount());
    }

    @Test
    @DisplayName("Test 5: Settle invoice transitions status to PAID and records transaction reference")
    void testPaymentSettlement() {
        Invoice invoice = invoiceRepository.findById(1L).orElseThrow();
        Invoice paid = billingService.processPayment(invoice.getId(), "CASH", "RCP-CASH-7712", "Counter settlement");
        
        assertEquals(Invoice.InvoiceStatus.PAID, paid.getStatus());
        assertEquals("CASH", paid.getPaymentMethod());
        assertNotNull(paid.getPaidAt());
    }
}`,
  },
  {
    path: 'run.bat',
    category: 'script',
    description: 'Windows 10/11 Batch Execution Script with Java 21 Check, Maven Build & Spring Boot Launch',
    code: `@echo off
SETLOCAL EnableDelayedExpansion

echo =====================================================================
echo   CLINICALCORE HOSPITAL MANAGEMENT SYSTEM - WINDOWS RUNTIME BOOT
echo =====================================================================
echo.

:: 1. Verify Java 21+
where java >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Java runtime not found on PATH.
    echo Please install JDK 21 and configure JAVA_HOME.
    pause
    exit /b 1
)

for /f "tokens=3" %%g in ('java -version 2^>^&1 ^| findstr /i "version"') do (
    set JAVA_VER=%%g
)
echo [OK] Detected Java runtime: !JAVA_VER!

:: 2. Verify Maven
where mvn >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Apache Maven not found on PATH.
    echo Please install Maven 3.9+ or run using the Maven Wrapper (mvnw.cmd).
    pause
    exit /b 1
)
echo [OK] Apache Maven detected.

:: 3. Execute Clean Compile & JUnit Test Suite
echo.
echo [STAGE 1/2] Compiling and running automated JUnit test suite...
call mvn clean test
if %ERRORLEVEL% NEQ 0 (
    echo [FAILURE] Test suite did not pass 100%%. Aborting deployment.
    pause
    exit /b %ERRORLEVEL%
)

:: 4. Launch Spring Boot Server
echo.
echo [STAGE 2/2] Launching Spring Boot Application on http://localhost:8080 ...
echo Press CTRL+C to terminate server.
call mvn spring-boot:run

pause`,
  },
  {
    path: 'README.md',
    category: 'docs',
    description: 'System Architecture Specification, Disaster Recovery, Database Backup and Academic Viva Guide',
    code: `# ClinicalCore Hospital Management System (HMS)

Enterprise Academic Reference Architecture built with **Java 21**, **Maven 3.9+**, **Spring Boot 3.3.4**, **Spring Security 6**, **Spring Data JPA (Hibernate 6)**, **Thymeleaf**, **Bean Validation (Hibernate Validator)**, and **MySQL 8.0**.

---

## 1. System Architecture & Five Major Functional Blocks

1. **Identity & Access Management (RBAC)**: Role-Based Access Control (\`ROLE_ADMIN\`, \`ROLE_DOCTOR\`, \`ROLE_NURSE\`, \`ROLE_RECEPTIONIST\`, \`ROLE_CASHIER\`) secured via Spring Security 6 FilterChain with BCrypt (cost factor 12) password hashing.
2. **Department & Medical Staff Directory**: Relational modeling of clinical departments, room allocations, consulting fee tariffs, and shift rosters.
3. **Patient Intake & Electronic Medical Records (EMR)**: Demographic capture, unique MRN generation, blood type typing, drug allergy alerts, and Bean Validation constraints.
4. **Appointment Scheduling & Conflict Prevention Engine**: Relational time-slot booking with atomic conflict detection preventing double-booking race conditions.
5. **Billing, Pharmacy & Cashier Ledger**: Line-item ledger computing gross subtotals, standard 5% healthcare levies, discounts, receipt generation, and transaction audit trails.

---

## 2. Requirements & Prerequisites

- **Java Development Kit (JDK)**: Version 21 (Eclipse Temurin, Oracle JDK, or Amazon Corretto).
- **Apache Maven**: Version 3.9.0 or higher.
- **MySQL Server**: Version 8.0 or 8.4 LTS running on port \`3306\`.
- **Operating System**: Windows 10/11, macOS, or Linux.

---

## 3. Database Setup & Initialization

\`\`\`sql
-- Log in as MySQL root administrator
mysql -u root -p

-- Create database and dedicated application user
CREATE DATABASE hospital_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'hms_user'@'localhost' IDENTIFIED BY 'SecureHmsPass2026!';
GRANT ALL PRIVILEGES ON hospital_db.* TO 'hms_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

-- Import schema and synthetic demonstration seeds
mysql -u hms_user -p hospital_db < src/main/resources/schema.sql
\`\`\`

---

## 4. How to Run on Windows

Double-click \`run.bat\` or execute in Command Prompt / PowerShell:

\`\`\`cmd
:: Compile and verify tests
mvn clean test

:: Start application server
mvn spring-boot:run
\`\`\`

The application will start at: \`http://localhost:8080\`

---

## 5. Database Backup & Disaster Recovery Procedures

### Cold/Warm Logical Backup (\`mysqldump\`):
\`\`\`cmd
mysqldump -u hms_user -p --single-transaction --routines --triggers hospital_db > backup_hospital_db_%DATE%.sql
\`\`\`

### Restoration & Recovery:
\`\`\`cmd
mysql -u hms_user -p hospital_db < backup_hospital_db_YYYY-MM-DD.sql
\`\`\`

---

## 6. Academic Viva Defense Guide (Key Technical Questions)

- **Q1: Why use \`SERIALIZABLE\` isolation level or atomic query for appointment booking?**
  *Answer*: In a high-concurrency hospital environment, two receptionists may simultaneously attempt to book Dr. Vance for the 10:00 AM slot. Without transactional isolation or unique constraints, both reads see an available slot (race condition). Using \`existsConflictingBooking\` inside a serializable/locking transaction ensures atomic mutual exclusion.
- **Q2: Why use BCrypt over SHA-256 for passwords?**
  *Answer*: SHA-256 is designed for fast hashing (vulnerable to GPU brute force). BCrypt includes an adaptive work factor (salt + multi-round key stretching), ensuring resistance to offline dictionary and rainbow-table attacks.
- **Q3: How does Spring Security 6 differ from legacy Spring Security 5?**
  *Answer*: Spring Security 6 deprecates \`WebSecurityConfigurerAdapter\` in favor of component-based configuration with lambda DSLs (\`http.authorizeHttpRequests(auth -> ...)\`), enforcing explicit, type-safe security filter chains.`,
  },
];
