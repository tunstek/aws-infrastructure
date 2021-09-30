def SERVICE_TIMEOUT = 90 // in seconds

def newswatcher_image
def auth_image
def public_api_image

pipeline {
   agent any

   // NB: The docker registery is @ 'localhost' here because the jenkins container is using the hosts docker service
   stages {
        stage('Clone repository') {
            steps {
                checkout scm
            }
        }

        stage('Build Services') {
            steps {
                // Build Auth
                script {
                    docker.withRegistry('https://localhost:5443', 'docker_registry_credentials') {
                        auth_image = docker.build("auth:test", "./auth")
                        auth_image.push()
                    }
                }
                // Build Public API
                script {
                    docker.withRegistry('https://localhost:5443', 'docker_registry_credentials') {
                        public_api_image = docker.build("public_api:test", "./public_api")
                        public_api_image.push()
                    }
                }
                // TODO:
                // Build Webservice
            }
        }

        stage('Deploy Test Stack') {
            steps {
                script {
                    runPlaybook("deploy_test_stack.yml")
                }
            }
        }

        stage('Test Services') {
            steps {
                script {
                    testService("auth")
                }
                script {
                    testService("public_api")
                }
            }
        }
   }

   post {
       success {
          script {
            // Pass test results to junit
            junit '*_results.xml'

            // Pass test coverage to Cobertura
            cobertura coberturaReportFile: '*_coverage.xml', autoUpdateHealth: false, autoUpdateStability: false, conditionalCoverageTargets: '70, 0, 0', enableNewApi: true, failUnhealthy: false, failUnstable: false, fileCoverageTargets: '80, 0, 0', lineCoverageTargets: '80, 0, 0', maxNumberOfBuilds: 0, methodCoverageTargets: '80, 0, 0', onlyStable: false, sourceEncoding: 'ASCII', zoomCoverageChart: false

             // Push :test images as :latest
             docker.withRegistry('https://localhost:5443', 'docker_registry_credentials') {
                 // Auth
                 auth_image.push('latest')
                 // Public API
                 public_api_image.push('latest')
             }

             // Deploy Production Stack
             runPlaybook("deploy_stack.yml")

             setBuildStatus("Build succeeded", "SUCCESS");
           }
       }

       failure {
          script {
           // print all service logs
           printServiceLogs("auth")
           printServiceLogs("public_api")

           setBuildStatus("Build failed", "FAILURE");
          }
       }

       cleanup {
            script {
                // Remove the test stack
                runPlaybook('remove_test_stack.yml')
            }
       }
   }
}


void setBuildStatus(String message, String state) {
  step([
      $class: "GitHubCommitStatusSetter",
      reposSource: [$class: "ManuallyEnteredRepositorySource", url: "https://github.com/tunstek/The-Operator"],
      contextSource: [$class: "ManuallyEnteredCommitContextSource", context: "ci/jenkins/build-status"],
      errorHandlers: [[$class: "ChangingBuildStatusErrorHandler", result: "UNSTABLE"]],
      statusResultSource: [ $class: "ConditionalStatusResultSource", results: [[$class: "AnyBuildResult", message: message, state: state]] ]
  ]);
}


void runPlaybook(String playbook_file) {
    // The Ansible plugin I'm using currently defaults to the values of 'ansible_ssh_key' in ansible/group_vars/all and ignores 'credentialsId'
    //      see: https://issues.jenkins-ci.org/browse/JENKINS-58555?src=confmacro
    // My workaround is to use sed to replace that line from the config
    sh (
        label: 'remove ansible_ssh_private_key_file line from ansible/group_vars/all',
        script: "sed -i.bak 's/ansible_ssh_private_key_file: .\\/theoperator.pem/# removed by jenkins/g' ansible/group_vars/all"
    )
    // run the playbook
    dir("ansible") {
        ansiColor('xterm') {
            ansiblePlaybook(playbook: playbook_file,
                            inventory: 'hosts',
                            installation: 'ansible_tool',
                            colorized: true,
                            credentialsId: "ec2-user-ssh")
        }
    }
}


void testService(String service_name) {
    // Wait until the service is running
    try {
        timeout(time: 90, unit: 'SECONDS') {
            waitUntil {
                script {
                    def r = sh(script: "curl http://${service_name} > /dev/null",
                               returnStatus: true)
                    return (r == 0);
                }
            }
        }
    }
    catch (e) {
        // Timeout has failed
        printServiceLogs("${service_name}")
        throw e
    }
    // Test the service
    sh(script: "curl http://${service_name}/test/xml > ${service_name}_response.zip")
    // extract ${service_name}_results.xml and ${service_name}_coverage.xml
    sh(script: "unzip -jo ${service_name}_response.zip")
}


void printServiceLogs(String service_name) {
    sh(script: "echo 'Printing ${service_name} logs:'")
    sh(script: "echo '${service_name} - Node Logs'")
    sh(script: "docker node ps | grep ${service_name}:test")
    sh(script: "echo '${service_name} - Service Logs'")
    sh(script: "docker service ls | grep test-stack_${service_name} | awk '{print \$1}' | xargs -n 1 docker service logs")
}
