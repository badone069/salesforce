({
    doInit : function(component, event, helper) {
       
        var width = 400; // scale the photo width to this
        var height = 0; // computed based on the input stream

     	var streaming = false;
        var video = null;
        var canvas = null;
        var photo = null;
        var startbutton = null;
        video = document.getElementById('video');
        canvas = document.getElementById('canvas');
        photo = document.getElementById('photo');
        startbutton = document.getElementById('startbutton');
        var clearbutton = document.getElementById('clearbutton');
        
        navigator.mediaDevices.getUserMedia({video: true, audio: false})
        .then(function(stream) {
            video.srcObject = stream;
            video.play();
        })
        .catch(function(err) {
            console.log("An error occurred: " + err);
        });
        
        video.addEventListener('canplay', function(ev){
            if (!streaming) {
                height = video.videoHeight / (video.videoWidth/width);
                
                // Firefox currently has a bug where the height can't be read from
                // the video, so make assumptions if this happens.
                
                if (isNaN(height)) {
                    height = width / (4/3);
                }
                
                video.setAttribute('width', width);
                video.setAttribute('height', height);
                canvas.setAttribute('width', width);
                canvas.setAttribute('height', height);
                streaming = true;
            }
        }, false);
        
        startbutton.addEventListener('click', function(ev){
            takepicture();
        }, false);
        
        clearbutton.addEventListener('click', function(ev){
            clearphoto();
        }, false);
        
        
        clearphoto();
      
        function clearphoto() {
            var context = canvas.getContext('2d');
            context.fillStyle = "#AAA";
            context.fillRect(0, 0, canvas.width, canvas.height);
            
            var data = canvas.toDataURL('image/png');
            photo.setAttribute('src', data);
        }
        
      	function takepicture() {
            var context = canvas.getContext('2d');
            if (width && height) {
                canvas.width = width;
                canvas.height = height;
                context.drawImage(video, 0, 0, width, height);
                var data = canvas.toDataURL('image/png');
                photo.setAttribute('src', data);
            } else {
                clearphoto();
            }
        }
        
    },
    savePhoto: function(component, event, helper) {
       	var image = document.getElementById("photo");
        var action = component.get('c.saveImageFile'); 
       	action.setParams({
            "imageUrl" : photo.getAttribute('src'),
            "recordId" : component.get('v.recordId')
        });
        action.setCallback(this, function(a){
            var state = a.getState(); // get the response state
            if(state == 'SUCCESS') {
                component.set('v.sObjList', a.getReturnValue());
            }
        });
        $A.enqueueAction(action);
	}
})