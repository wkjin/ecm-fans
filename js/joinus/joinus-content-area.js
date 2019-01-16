var contentarea={
    // _options={

    // },
    _isshow: function () {
        var alist=$('#joinus-topic').children('a');
        var dlist=$('#joinus-content').children('div');
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
    init: function(options){
        var self = this;
        self._isshow();
        // Object.assign(self._options, options);
    } 
}
$(function(){
    $('.joinus-content-area').load('./tpl/joinus/joinus-content-area.html', function(){
        contentarea.init();        
    });
});