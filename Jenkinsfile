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
sh("""cat <<'EOF' | kubectl apply -f -
apiVersion: extensions/v1beta1
kind: Deployment
metadata:
  name: defn.ly
  namespace: default
  labels:
    app: defn.ly
spec:
  replicas: 1
  strategy:
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
    type: RollingUpdate
  template:
    metadata:
      labels:
        app: defn-ly
    spec:
      containers:
        - name: node
          image: wgleich/defn-ly:${env.BUILD_ID}
          ports:
            - containerPort: 8080
              protocol: TCP
      restartPolicy: Always
---
kind: Service
apiVersion: v1
metadata:
  name: defn-ly
  namespace: default
spec:
  type: LoadBalancer
  selector:
    app: defn-ly
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080""")

        }
      }
    }
  }
}
