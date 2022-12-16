public class spoonacular {
    private static final String SPOONACULAR_API = 'https://api.spoonacular.com';
    private static final String API_KEY = 'cc2ac50b22f146e4859fe46c589fd563';

@AuraEnabled
public static String getRandomReceipe(){
Http http = new Http();
HttpRequest request = new HttpRequest();
request.setEndpoint(SPOONACULAR_API + '/recipes/random?apiKey=' + API_KEY);
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
@AuraEnabled
    
public static String getReceipe(String receipeId){
Http http = new Http();
HttpRequest request = new HttpRequest();
request.setEndpoint(SPOONACULAR_API + '/recipes/'+ receipeId + '/information?apiKey=' + API_KEY);
request.setMethod('GET');
    
HttpResponse response = http.send(request);
// If the request is successful, parse the JSON response.
System.debug('response code' + response.getStatusCode());
if(response.getStatusCode() == 200) {
    System.debug('response' + response.getBody());
    return response.getBody();
    
}
 return ';';
}
 
public static String getReceipeByIngredient(String ingredients){
Http http = new Http();
HttpRequest request = new HttpRequest();
request.setEndpoint(SPOONACULAR_API + '/recipes/findByIngredients?apiKey=' + API_KEY + '&ingredients=' + ingredients);
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