# ZAP Scanning Report

ZAP by [Checkmarx](https://checkmarx.com/).


## Summary of Alerts

| Risk Level | Number of Alerts |
| --- | --- |
| High | 0 |
| Medium | 0 |
| Low | 3 |
| Informational | 1 |




## Insights

| Level | Reason | Site | Description | Statistic |
| --- | --- | --- | --- | --- |
| Low | Warning |  | ZAP errors logged - see the zap.log file for details | 2    |
| Info | Informational | http://app:3050 | Percentage of responses with status code 2xx | 50 % |
| Info | Informational | http://app:3050 | Percentage of responses with status code 5xx | 50 % |
| Info | Informational | http://app:3050 | Percentage of endpoints with content type application/json | 100 % |
| Info | Informational | http://app:3050 | Percentage of endpoints with method GET | 33 % |
| Info | Informational | http://app:3050 | Percentage of endpoints with method POST | 66 % |
| Info | Informational | http://app:3050 | Count of total endpoints | 6    |
| Info | Informational | http://app:3050 | Percentage of slow responses | 33 % |







## Alerts

| Name | Risk Level | Number of Instances |
| --- | --- | --- |
| A Server Error response code was returned by the server | Low | 3 |
| Application Error Disclosure | Low | 3 |
| Information Disclosure - Debug Error Messages | Low | 3 |
| Non-Storable Content | Informational | Systemic |




## Alert Detail



### [ A Server Error response code was returned by the server ](https://www.zaproxy.org/docs/alerts/100000/)



##### Low (High)

### Description

A response code of 500 was returned by the server.
This may indicate that the application is failing to handle unexpected input correctly.
Raised by the 'Alert on HTTP Response Code Error' script

* URL: http://app:3050/v1/examples/10
  * Node Name: `http://app:3050/v1/examples/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://app:3050/v1/examples
  * Node Name: `http://app:3050/v1/examples ()({name,description,quantity,price,active,registration_date})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``
* URL: http://app:3050/v1/geo/geocode
  * Node Name: `http://app:3050/v1/geo/geocode ()({address})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `500`
  * Other Info: ``


Instances: 3

### Solution



### Reference



#### CWE Id: [ 388 ](https://cwe.mitre.org/data/definitions/388.html)


#### WASC Id: 20

#### Source ID: 4

### [ Application Error Disclosure ](https://www.zaproxy.org/docs/alerts/90022/)



##### Low (Medium)

### Description

This page contains an error/warning message that may disclose sensitive information like the location of the file that produced the unhandled exception. This information can be used to launch further attacks against the web application. The alert could be a false positive if the error message is found inside a documentation page.

* URL: http://app:3050/v1/examples/10
  * Node Name: `http://app:3050/v1/examples/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://app:3050/v1/examples
  * Node Name: `http://app:3050/v1/examples ()({name,description,quantity,price,active,registration_date})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``
* URL: http://app:3050/v1/geo/geocode
  * Node Name: `http://app:3050/v1/geo/geocode ()({address})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `HTTP/1.1 500 Internal Server Error`
  * Other Info: ``


Instances: 3

### Solution

Review the source code of this page. Implement custom error pages. Consider implementing a mechanism to provide a unique error reference/identifier to the client (browser) while logging the details on the server side and not exposing them to the user.

### Reference



#### CWE Id: [ 550 ](https://cwe.mitre.org/data/definitions/550.html)


#### WASC Id: 13

#### Source ID: 3

### [ Information Disclosure - Debug Error Messages ](https://www.zaproxy.org/docs/alerts/10023/)



##### Low (Medium)

### Description

The response appeared to contain common error messages returned by platforms such as ASP.NET, and Web-servers such as IIS and Apache. You can configure the list of common debug messages.

* URL: http://app:3050/v1/examples/10
  * Node Name: `http://app:3050/v1/examples/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `internal server error`
  * Other Info: ``
* URL: http://app:3050/v1/examples
  * Node Name: `http://app:3050/v1/examples ()({name,description,quantity,price,active,registration_date})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `internal server error`
  * Other Info: ``
* URL: http://app:3050/v1/geo/geocode
  * Node Name: `http://app:3050/v1/geo/geocode ()({address})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `internal server error`
  * Other Info: ``


Instances: 3

### Solution

Disable debugging messages before pushing to production.

### Reference



#### CWE Id: [ 1295 ](https://cwe.mitre.org/data/definitions/1295.html)


#### WASC Id: 13

#### Source ID: 3

### [ Non-Storable Content ](https://www.zaproxy.org/docs/alerts/10049/)



##### Informational (Medium)

### Description

The response contents are not storable by caching components such as proxy servers. If the response does not contain sensitive, personal or user-specific information, it may benefit from being stored and cached, to improve performance.

* URL: http://app:3050/v1/examples/10
  * Node Name: `http://app:3050/v1/examples/10`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: http://app:3050/v1/health
  * Node Name: `http://app:3050/v1/health`
  * Method: `GET`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: http://app:3050/v1/examples
  * Node Name: `http://app:3050/v1/examples ()({name,description,quantity,price,active,registration_date})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: http://app:3050/v1/geo/geocode
  * Node Name: `http://app:3050/v1/geo/geocode ()({address})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``
* URL: http://app:3050/v1/geo/route
  * Node Name: `http://app:3050/v1/geo/route ()({origin:{latitude,longitude},destination:{latitude,longitude}})`
  * Method: `POST`
  * Parameter: ``
  * Attack: ``
  * Evidence: `no-store`
  * Other Info: ``

Instances: Systemic


### Solution

The content may be marked as storable by ensuring that the following conditions are satisfied:
The request method must be understood by the cache and defined as being cacheable ("GET", "HEAD", and "POST" are currently defined as cacheable)
The response status code must be understood by the cache (one of the 1XX, 2XX, 3XX, 4XX, or 5XX response classes are generally understood)
The "no-store" cache directive must not appear in the request or response header fields
For caching by "shared" caches such as "proxy" caches, the "private" response directive must not appear in the response
For caching by "shared" caches such as "proxy" caches, the "Authorization" header field must not appear in the request, unless the response explicitly allows it (using one of the "must-revalidate", "public", or "s-maxage" Cache-Control response directives)
In addition to the conditions above, at least one of the following conditions must also be satisfied by the response:
It must contain an "Expires" header field
It must contain a "max-age" response directive
For "shared" caches such as "proxy" caches, it must contain a "s-maxage" response directive
It must contain a "Cache Control Extension" that allows it to be cached
It must have a status code that is defined as cacheable by default (200, 203, 204, 206, 300, 301, 404, 405, 410, 414, 501).

### Reference


* [ https://datatracker.ietf.org/doc/html/rfc7234 ](https://datatracker.ietf.org/doc/html/rfc7234)
* [ https://datatracker.ietf.org/doc/html/rfc7231 ](https://datatracker.ietf.org/doc/html/rfc7231)
* [ https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html ](https://www.w3.org/Protocols/rfc2616/rfc2616-sec13.html)


#### CWE Id: [ 524 ](https://cwe.mitre.org/data/definitions/524.html)


#### WASC Id: 13

#### Source ID: 3


