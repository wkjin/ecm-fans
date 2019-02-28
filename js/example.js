var pageContentArea={
    _options:{

    },
    _mergeOptions: function(options){
        var self = this;
        Object.assign(self._options, options);
    },
    _initData: function(){
        var self = this;

    },
    _initEven: function(){
        var self = this;

    },
    _initEnd: function(){
        var self = this;
    },
    init: function(options){
        var self = this;
        self._mergeOptions(options);
        self._initData();
        self._initEven();
        self._initEnd();
    } 
};

$(function(){
    
});