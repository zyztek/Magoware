#!/bin/bash

if [ ! -e server.js ]
then
	echo "Error: could not find main application server.js file"
	echo "You should run the generate-ssl-certs.sh script from the main SEAN.JS application root directory"
	echo "i.e: bash scripts/generate-ssl-certs.sh"
	exit -1
fi

echo "Generating self-signed certificates..."
mkdir -p ./config/sslcertificate
openssl genrsa -out ./config/sslcertificate/key.txt 4096
openssl req -new -key ./config/sslcertificate/key.txt -out ./config/sslcertificate/csr.pem
openssl x509 -req -days 365 -in ./config/sslcertificate/csr.pem -signkey ./config/sslcertificate/key.txt -out ./config/sslcertificate/certificate.txt
rm ./config/sslcertificate/csr.pem
chmod 600 ./config/sslcertificate/key.txt ./config/sslcertificate/certificate.txt