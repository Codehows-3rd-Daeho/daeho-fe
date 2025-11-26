pipeline {
    agent any
    
    environment {
        IMAGE_NAME = 'react-frontend'
        CONTAINER_NAME = 'react-app'
        DOCKER_NETWORK = 'app-network'
        HTTP_PORT = '80'
        HTTPS_PORT = '443'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code from GitHub...'
                checkout scm
            }
        }
        
        stage('Build Docker Image') {
            steps {
                script {
                    echo 'Building Docker image...'
                    sh """
                        docker build -t ${IMAGE_NAME}:latest .
                    """
                }
            }
        }
        
        stage('Stop Old Container') {
            steps {
                script {
                    echo 'Stopping and removing old container...'
                    sh """
                        docker stop ${CONTAINER_NAME} || true
                        docker rm ${CONTAINER_NAME} || true
                    """
                }
            }
        }
        
        stage('Create Network and Volume') {
            steps {
                script {
                    echo 'Creating Docker network and volume if not exists...'
                    sh """
                        docker network create ${DOCKER_NETWORK} || true
                        docker volume create certbot-webroot || true
                    """
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo 'Deploying new container...'
                    sh """
                        docker run -d \
                            --name ${CONTAINER_NAME} \
                            --network ${DOCKER_NETWORK} \
                            -p ${HTTP_PORT}:80 \
                            -p ${HTTPS_PORT}:443 \
                            -v /etc/letsencrypt:/etc/letsencrypt:ro \
                            -v certbot-webroot:/var/www/certbot:ro \
                            --restart unless-stopped \
                            ${IMAGE_NAME}:latest
                    """
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                script {
                    echo 'Cleaning up unused Docker images...'
                    sh """
                        docker image prune -f
                    """
                }
            }
        }
    }
    
    post {
        success {
            echo 'Deployment successful!'
        }
        failure {
            echo 'Deployment failed!'
        }
    }
}