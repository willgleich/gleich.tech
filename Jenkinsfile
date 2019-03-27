pipeline {
  agent none
  stages {
      stage('Build and Push Image') {
    agent {
    kubernetes {
      label 'docker-build'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: jenkins
  containers:
  - name: docker-build
    image: docker:18.06-dind
    command:
    - cat
    tty: true
    volumeMounts:
    - name: dockersock
      mountPath: "/var/run/docker.sock"
  volumes:
  - name: dockersock
    hostPath:
      path: /var/run/docker.sock
  securityContext:
    privileged: true
"""
  }
  }
      steps {
        script {
         container('docker-build'){
          // Change deployed image in canary to the one we just built
          def app
          checkout scm
          app = docker.build("wgleich/defn-ly")
          docker.withRegistry('https://registry.hub.docker.com', 'docker-hub-credentials') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
            }
        }
      }
    }
  }
    stage('Deploy Project') {
        agent {
    kubernetes {
      label 'node-build'
      defaultContainer 'jenkins-slave'
      yaml """
apiVersion: v1
kind: Pod
metadata:
labels:
  component: ci
spec:
  # Use service account that can deploy to all namespaces
  serviceAccountName: jenkins
  containers:
  - name: kubectl
    image: gcr.io/cloud-builders/kubectl
    command:
    - cat
    tty: true
"""
}
  }
      steps {
        container('kubectl') {
        script{
        checkout scm
        }
          sh("kubectl delete -f deploy.yaml")
          sh("kubectl apply -f deploy.yaml")
        }
      }
    }
  }
}
