var contentArea = {
    _options: {
        parentSelector: '.content-area',//父容器的选择器
        bannerSelector: '.banner-area',//banner图的容器
        bannerImgContainerSelector: 'img',//banner图片容器的选择器
        bannerImgUrlAttrName: 'data-url',//banner图片上面的url的属性名
        bannerClickClass: 'banner-click',//banner被点击的class
        animateTime: 2000,//banner图的动画时间
    },

    _parentObj: null,//父容器的对象
    _imgNum: 0,//图片的数量
    _showImgIndex: 0,//显示图片的索引


    _initData: function(){
        var self = this;
        self._parentObj = $(self._options.parentSelector);
        self._imgNum = self._parentObj.find(self._options.bannerSelector).find('img').length;

    },
    
    _initEven: function(){
        var self = this;
        self._parentObj.find(self._options.bannerSelector).off('click').on('click', function(e){
            var $this = $(this);
            if(e.target === 'img'){//如果是点击在图片上，那么就纠正点击在banner区域上
                $this = $this.parent();
            }
            var fontWidth = 48;
            var width = $this.width();
            var height = $this.height();
            var offsetY = e.offsetY;
            var targetArea = (height - fontWidth)/2;
            if(offsetY >= targetArea && offsetY <= (targetArea + fontWidth) ){
                var bannerClickClass = self._options.bannerClickClass;
                if($this.hasClass(bannerClickClass)){
                    return;
                }
                $this.addClass(bannerClickClass);
                if(e.offsetX <= fontWidth){
                    self._changeBanner(function(){
                        $this.removeClass(bannerClickClass);
                    });
                    return;
                }else if(e.offsetX >= (width - fontWidth)){
                    self._changeBanner(function(){
                        $this.removeClass(bannerClickClass);
                    }, false);
                    return;
                }
            }
            //
            var jumpUrl = $this.find('img:visible').attr(self._options.bannerImgUrlAttrName);
            if(typeof jumpUrl !== 'undefined'){
                window.location.href = jumpUrl;
            }
        });
    },

    //图片轮播
    _changeBanner: function(callback, isLeft, goalIndex){
        var self = this;
        var imgContainerObj = self._parentObj.find(self._options.bannerSelector);
        if(typeof isLeft !== 'undefined'){
            isLeft = !!isLeft;
        }else{
            isLeft = true;
        }
        //目标图片索引
        var tempGoalIndex = Number(goalIndex);
        if(typeof goalIndex !== 'undefined' || isNaN(tempGoalIndex)){
            var tempIndex = self._imgNum + self._showImgIndex;
            if(isLeft){
                tempIndex --;
            }else{
                tempIndex ++;
            }
            tempGoalIndex = tempIndex%self._imgNum;
        }else{
            tempGoalIndex = tempGoalIndex%self._imgNum;
        }
        //找到真正显示的图片
        var showImgObj = imgContainerObj.find('img:nth-child(' + (self._showImgIndex + 1) + ')');
        var goalImgObj = imgContainerObj.find('img:nth-child(' + (tempGoalIndex + 1) + ')');
        if(showImgObj.length <= 0 || goalImgObj.length <= 0){
            return false;
        }else{
            var animateTime = self._options.animateTime;
            //进行移动
            if(isLeft){//向左移动
                goalImgObj.css({left: '150%'}).show().animate({ left: '50%'}, animateTime);
                showImgObj.animate({ left: '-50%'}, animateTime, function(){
                    if(typeof callback === 'function'){
                        callback();
                    }
                });
            }else{//向右移动
                goalImgObj.css({left: '-50%'}).show().animate({ left: '50%'}, animateTime);
                showImgObj.animate({ left: '150%'}, animateTime, function(){
                    if(typeof callback === 'function'){
                        callback();
                    }
                });
            }
            self._showImgIndex = tempGoalIndex;
        }
        
    },
    
    _initEnd: function(){
        
    },

    init: function(){
        var self = this;
        self._initData();
        self._initEven();
        self._initEnd();    
    }  
};


$(function(){
    $('.content-area').load('./tpl/index/content-area.html', function(){
        contentArea.init();                
    });
});
