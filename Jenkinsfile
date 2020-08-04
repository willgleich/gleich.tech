pipeline {
  agent none
  stages {
    stage('Build with Kaniko') {
      agent {
        kubernetes {
          //cloud 'kubernetes'
          yaml """
    kind: Pod
    spec:
      containers:
      - name: kaniko
        image: gcr.io/kaniko-project/executor:debug
        imagePullPolicy: Always
        command:
        - /busybox/cat
        tty: true
        volumeMounts:
          - name: jenkins-docker-cfg
            mountPath: /kaniko/.docker
      volumes:
      - name: jenkins-docker-cfg
        projected:
          sources:
          - secret:
              name: regcred
              items:
                - key: .dockerconfigjson
                  path: config.json
    """
        }
      }

      steps {
        git 'https://gitlab.com/wgleich/defn-ly.git'
        container(name: 'kaniko') {
            sh '''
            /kaniko/executor --dockerfile `pwd`/Dockerfile --context `pwd` --destination=wgleich/defn-ly:v$BUILD_NUMBER
            '''
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
  name: will.gleich
  namespace: dev
  labels:
    app: will.gleich
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
          image: wgleich/defn-ly:v${BUILD_NUMBER}
          env:
            - name: rabbit_mq
              value: "rabbit-rabbitmq-ha.rabbit.svc:5672"
          ports:
            - containerPort: 8080
              protocol: TCP
      restartPolicy: Always
---
kind: Service
apiVersion: v1
metadata:
  name: defn-ly
  namespace: dev
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

