## AUTH Service

redis-cli is available here, use: `redis-cli -h redis`

This service allows other services to authenticate users. Its primary purpose is to generate and verify tokens that are held in the Redis service.

Both this service and the redis service exist in their own network, the 'auth' network. Under no circumstances should any other service be allowed to join this network.

### Protocol
See [here](https://www.ida.liu.se/~TDP024/labs/hmacarticle.pdf) for brief overview.

This is a service that every other service will ping to verify user credentials.

The verification will happen once, then each service will cache the request token and trust any future request using this token until the token expires.


Let's say someone wants to make an API request like so:

| URL                            | GET Parameters                           |
| -------------------------------| :-----------------------------------: |
| http://api.news.localhost/news | ```{'api_key': 'ib4wb4jfe', 'timestamp':'...14:30 (UTC)' 'sym': 'APPL'}``` |

I DON'T CARE. API calls are tracked by the api-key, it's up to the holder of the key not to distribute it. Even if they do, I don't care.
* This service can provide a way of keeping track of API usage for a specific user KEY.



### How Tokens Work


### Redis
A user in Redis looks something like this:
```
john@doe.com: {
    username: 'john@doe.com',
    hashed_password: 'iub3ow98fhiunwh398hu',
    api_token: 'hsofuink3onsdrgefp',
    verified: False
}
hsofuink3onsdrgefp: {
    username: 'john@doe.com',
    type: 'api_token',
    api_token_requests: 0
}
```
When a user registers, we give the user an API token that is used for serving any 'api.example.com' requests. We also set the users initial 'verified' status to false and their api_token_requests count to 0.  

Sequence diagrams can be seen on the main README page
