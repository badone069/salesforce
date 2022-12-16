public with sharing class RingCentral {
    String token1;
    
    public class RingCentralCallOut {
        public static String getAcessToken(){
            Http http = new Http();
            HttpRequest request = new HttpRequest();
            request.setEndpoint('https://platform.devtest.ringcentral.com/restapi/oauth/token');
            request.setMethod('POST');
            String username = 'qPLfCGtCHQ7SHdPevfVw51w';
            String password = 'A4j2gTY0SLGBXkXK5qECDAjxKF5A2FTSyS_CMVowvjpA';
            Blob headerValue = Blob.valueOf(username + ':' + password);
            System.debug(headerValue);
            String authorizationHeader = 'Basic '+ EncodingUtil.base64Encode(headerValue);
            String payLoad = 'grant_type=password'
                + '&username=' + EncodingUtil.urlEncode('+14707816685','UTF-8')
                + '&password=' + EncodingUtil.urlEncode('Dep07@gmail.c', 'UTF-8')
                + '&extension=101';
            System.debug('@@@@@@@@@@@');
            System.debug(authorizationHeader);
            request.setHeader('Authorization', authorizationHeader);
            request.setHeader('Accept','application/json');
            request.setHeader('Content-Type', 'application/x-www-form-urlencoded');
            request.setBody(payLoad);
            HttpResponse response = http.send(request);
            System.debug(response.getBody());
            String token;
            if(response.getStatusCode() == 200){
                System.debug('SUCESSSSS');
                System.debug(response.getBody());
                Map<String, Object> results = (Map<String, Object>)JSON.deserializeUntyped(response.getBody());
                 String refreshtoken='';
                    token = (String)results.get('access_token');
                refreshtoken = (String)results.get('refresh_token');
                System.debug('@@@@@@');
                System.debug(token);
                    }else{
                         System.debug('The status code returned was not expected: ' +response.getStatusCode() + ' ' + response.getStatus());
                    }
            return token;
        }
    }

   


private static final String RINGCENTRAL_API = 'https://platform.devtest.ringcentral.com';
private static final String API_KEY = token1;
public static String ringOut(){
Http http = new Http();
HttpRequest request = new HttpRequest();
request.setEndpoint(RINGCENTRAL_API + '/recipes/random?apiKey=' + API_KEY);
request.setMethod('GET');
HttpResponse response = http.send(request);
// If the request is successful, parse the JSON response.
System.debug('response code' + response.getStatusCode());
if(response.getStatusCode() == 200) {
    System.debug('response' + response.getBody());
    return response.getBody();
}
return '';
    }
}
