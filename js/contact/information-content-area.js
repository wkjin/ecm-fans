var productList = {
    _options: {
        
    },
    
    init: function(options){
        var self = this;
        Object.assign(self._options, options);
    }    
};

$(function(){
    $('.content-area').load('./tpl/contact/information-content-area.html', function(){
        productList.init();        
    });
});
