plugins {
    id("java")
    id("org.springframework.boot") version "3.5.6"
    id("io.spring.dependency-management") version "1.1.7"
}

group = "org.example"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}


dependencies {

    implementation("com.mysql:mysql-connector-j:9.4.0")
    implementation("org.springframework.boot:spring-boot-starter-web")

}

tasks.test {
    useJUnitPlatform()
}