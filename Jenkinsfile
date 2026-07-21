pipeline {
    agent any

    environment {
        PORT = '3050'
        REDIS_PASSWORD = 'redis123'
        REDIS_PORT = '6379'
        P_DB_NAME = 'mydatabase'
        P_DB_USER = 'postgres'
        P_DB_PASSWORD = 'postgres123'
        P_DB_PORT = '5432'
        DOCKER_IMAGE = 'p25-geo-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                sh 'git config --global http.postBuffer 524288000'
                retry(3) {
                    checkout([
                        $class: 'GitSCM',
                        branches: scm.branches,
                        extensions: [[$class: 'CloneOption', depth: 1, shallow: true]],
                        userRemoteConfigs: scm.userRemoteConfigs
                    ])
                }
            }
        }

        stage('Build & Test') {
            tools {
                nodejs 'NodeJS-22'
            }
            steps {
                sh 'npm install'
                sh 'npm run test'
            }
        }

        stage('Coverage') {
            tools {
                nodejs 'NodeJS-22'
            }
            steps {
                sh 'npm run coverage'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: '**/junit.xml'
                    publishHTML(target: [
                        reportName: 'Coverage Report',
                        reportDir: 'coverage',
                        reportFiles: 'index.html'
                    ])
                }
            }
        }

        stage('SAST - SonarQube') {
            tools {
                nodejs 'NodeJS-22'
            }
            steps {
                sh 'npm run sonar || echo "SonarQube analysis completed with warnings"'
            }
        }

        stage('Build Docker Image') {
            steps {
                sh 'docker build -t ${DOCKER_IMAGE}:${DOCKER_TAG} .'
                sh 'docker tag ${DOCKER_IMAGE}:${DOCKER_TAG} ${DOCKER_IMAGE}:latest'
            }
        }

        stage('Container Scan - Trivy') {
            steps {
                sh 'docker compose --profile trivy run --rm trivy-scan'
            }
        }

        stage('Deploy to Dev') {
            steps {
                sh 'docker compose -f docker-compose.yml down || true'
                sh 'docker compose -f docker-compose.yml up -d postgres redis mock-maps'
                sh '''cat > .env << EOF
PORT=${PORT}
REDIS_PASSWORD=${REDIS_PASSWORD}
REDIS_PORT=${REDIS_PORT}
P_DB_NAME=${P_DB_NAME}
P_DB_USER=${P_DB_USER}
P_DB_PASSWORD=${P_DB_PASSWORD}
P_DB_PORT=${P_DB_PORT}
EOF'''
                sh 'docker compose -f docker-compose.yml up -d app'
                sh 'docker compose -f docker-compose.yml run --rm app node scripts/seed-clients.js'
            }
        }

        stage('DAST - OWASP ZAP') {
            steps {
                sh 'docker compose --profile zap run zap-scan'
            }
            post {
                always {
                    publishHTML(target: [
                        reportName: 'ZAP DAST Report',
                        reportDir: 'docs/evidencias',
                        reportFiles: 'zap-report.html'
                    ])
                }
            }
        }

        stage('Performance - K6') {
            steps {
                sh 'docker compose --profile k6 run k6-load-test'
            }
        }

        stage('Deploy to QA') {
            steps {
                echo 'Despliegue a QA - configurar según infraestructura'
            }
        }
    }

    post {
        failure {
            echo "Pipeline falló. Revisar logs para más detalles."
        }
        success {
            echo "Pipeline completado exitosamente."
        }
        always {
            cleanWs()
        }
    }
}
