var onlineMessage = {
    _options: {
       

    },

    

    init: function(options){
        var self = this;
        Object.assign(self._options, options);
        
    }    
};

$(function(){
    $('.content-area').load('./tpl/contact/online-message-content-area.html', function(){
        onlineMessage.init();        
    });
});
