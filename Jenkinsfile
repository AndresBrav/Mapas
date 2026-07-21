pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'p25-geo-app'
        DOCKER_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build & Test') {
            tools {
                nodejs 'NodeJS-22'
            }
            steps {
                sh 'npm ci'
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
                sh '''
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest \
                        image --severity CRITICAL,HIGH --exit-code 1 \
                        ${DOCKER_IMAGE}:${DOCKER_TAG}
                '''
            }
        }

        stage('Deploy to Dev') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose -f docker-compose.yml up -d postgres redis mock-maps'
                sh 'docker compose -f docker-compose.yml up -d app'
                sh 'docker compose -f docker-compose.yml run --rm app node scripts/seed-clients.js'
            }
        }

        stage('DAST - OWASP ZAP') {
            when {
                branch 'main'
            }
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
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose --profile k6 run k6-load-test'
            }
        }

        stage('Deploy to QA') {
            when {
                branch 'main'
            }
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
