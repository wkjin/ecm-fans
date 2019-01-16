var information={
    _option:{

    },
    _aIndex: function () {
        var alist=$('#about-topic').children('a');
        var dlist=$('#about-content').children('div');
        var len=alist.length;
        alist.click(function(){
            for(let i=0;i<len;i++){
                dlist[i].style="display:none";
                alist[i].style="color:black";
            }
            var index=$(this).index();
            dlist[index].style="display:block";
            alist[index].style="color:green";
        });
        
    },
    init: function(){
        var self = this;
        self._aIndex();
    } 
};

$(function(){
    $('.about-content-area').load('../tpl/about/about-content-area.html', function(){
        information.init();        
    });
});