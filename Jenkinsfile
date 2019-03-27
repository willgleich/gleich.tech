pipeline {
  agent any
  stages {
      stage('Build Image') {
      steps {
        script {
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
          // Change deployed image in canary to the one we just built
          sh("kubectl delete -f deploy.yaml")
          sh("kubectl apply -f deploy.yaml")
        }
      }
    }
  }
}
