FROM openjdk:8-jdk-alpine

RUN apk --update add fontconfig ttf-dejavu

VOLUME /tmp

ADD target/sindicato-0.0.1.jar sindicato-0.0.1.jar

#EXPOSE 8080

ENTRYPOINT ["java","-jar","sindicato-0.0.1.jar"]
