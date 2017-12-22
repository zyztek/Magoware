
MAGOWARE is an IPTV/OTT solution for Pay Tv Businesses. The administration portal is build on Sequelize, Express, ng-admin, and Node.js

### Installation

### Before you start, make sure you have these prerequisites installed:

 * Node.js
 * NPM

### Follow these steps to install Magoware  Management System

Download and install NODE JS from the following link:

https://nodejs.org/en/download/

We recommend versions 7.x.x or 8.x.x installed for nodejs

Download MAGOWARE Backoffice application from Github

https://github.com/MAGOWARE/backoffice-administration.git

Run the following command within the root folder to install application libriaries:
```
sudo npm install (in linux)
npm install (in windows)
```
Create a database on MySQL server.

Make sure that the collation and charset of your schema supports the languages that you intend to use.

After all libraries are installed, run the following command to start the server:
```
sudo node server.js (in linux)
node server.js (in windows)
```
When application runs for the first time, it will automatically create database structures and populate necessary tables with default values.


### Database migration
If this is an upgrade, please run the following to upgrade the database with the latest changes:

```bash
$ sequelize db:migrate
```

Login to start creating accounts and assets

go to: 
## http://YourDomain_or_IP/admin 
and login with username admin and password admin


---

## License
(The MIT License)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
