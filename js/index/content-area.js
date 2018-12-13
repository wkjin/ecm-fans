var contentArea = {
    _options: {
        parentSelector: '.content-area',//父容器的选择器
        //banner部分
        bannerSelector: '.banner-area',//banner图的容器
        bannerImgContainerSelector: 'img',//banner图片容器的选择器
        bannerImgUrlAttrName: 'data-url',//banner图片上面的url的属性名
        bannerClickClass: 'banner-click',//banner被点击的class
        bannerAnimateTime: 1500,//banner图的动画时间

        //产品轮播图部分
        productSelector: '.product-area',//产品展示图的容器
        productCanMoveClass: 'product-can-move',//产品展示图可以移动的class
        productMovingClass: 'product-moving',//产品正在移动的class
        productShowSelector: '.product-show',//产品展示图显示的选择器
        productAnimateTime: 1500,//产品展示图的过渡动画时间（ms）
    },

    _parentObj: null,//父容器的对象

    //banner图
    _bannerNum: 0,//图片的数量
    _showBannerIndex: 0,//显示图片的索引
    _bannerTimer: null,//banner图的时间记录器

    //产品展示图
    _productNum: 0,//产品的数量
    _showProductIndex: 0,//显示产品的索引
    _productTimer: null,//product动画的计时器

    _initData: function(){
        var self = this;
        self._parentObj = $(self._options.parentSelector);

        //banner图
        self._bannerNum = self._parentObj.find(self._options.bannerSelector).find('img').length;

        //产品展示图
        self._productParentObj = $(self._options.productSelector);
        self._productNum =  self._parentObj.find(self._options.productSelector).find('> a').length;
        //生产产品展示的轮播图
        self._generateProductShow();
    },

    //生成产品展示图的轮播
    _generateProductShow: function(){
        var self = this;
        var parentObj = self._parentObj.find(self._options.productSelector);
        //根据数量放在不同的product-show进行待显示与显示

        //把前面四张产品图放在显示的div中
        var html = '<div class="' + self._options.productShowSelector.replace(/\./, '') + '"></div>';
        var showObj = $(html);
        var cloneFirstImg = parentObj.find('> a:lt(4)');
        self._showProductIndex = cloneFirstImg.length -1;
        showObj.html(cloneFirstImg.clone());
        parentObj.prepend(showObj);
        parentObj.addClass(self._options.productCanMoveClass);
    },
    
    _initEven: function(){
        var self = this;
        // banner图展示
        //绑定banner图的点击事件
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
                //设置定时器，强制移除点击
                if(self._bannerTimer !== null){
                    clearTimeout(self._bannerTimer);
                    self._bannerTimer = null;
                }
                self._bannerTimer  = setTimeout(function(){
                    $this.removeClass(bannerClickClass);
                    self._bannerTimer = null;
                }, 3000);
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

        //产品图片展示
        //绑定产品图的点击事件
        self._parentObj.find(self._options.productSelector).off('click').on('click', function(e){
            e.stopPropagation();
            var $this = $(this);
            var tagName = e.target.tagName;
            if(tagName === 'IMG' || tagName === 'A'){
                alert('点击的是图片');
                e.preventDefault();
                return;
            }else{//不是点击在图片上
                var fontWidth = 36;
                var width = $this.width();
                var height = $this.height();
                var offsetY = e.offsetY;
                var targetArea = (height - fontWidth)/2;
                //点击在左右箭头上
                if(offsetY >= targetArea && offsetY <= (targetArea + fontWidth) ){
                    //查找到显示的product-show与等待显示的div

                    if(e.offsetX <= fontWidth){
                        self._changeProduct();
                        alert('点击在左箭头上');
                        return;
                    }else if(e.offsetX >= (width - fontWidth)){
                        alert('点击在右箭头上');
                        return;
                    }
                }
            }
        });
    },

    //banner图片切换
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
            var tempIndex = self._bannerNum + self._showBannerIndex;
            if(isLeft){
                tempIndex --;
            }else{
                tempIndex ++;
            }
            tempGoalIndex = tempIndex%self._bannerNum;
        }else{
            tempGoalIndex = tempGoalIndex%self._bannerNum;
        }
        //找到真正显示的图片
        var showImgObj = imgContainerObj.find('img:nth-child(' + (self._showBannerIndex + 1) + ')');
        var goalImgObj = imgContainerObj.find('img:nth-child(' + (tempGoalIndex + 1) + ')');
        if(showImgObj.length <= 0 || goalImgObj.length <= 0){
            return false;
        }else{
            var animateTime = self._options.bannerAnimateTime;
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
            self._showBannerIndex = tempGoalIndex;
        }
        
    },

    //product切换
    _changeProduct: function(callback, isRight, goalIndex){
        var self = this;
        var productContainerObj = self._parentObj.find(self._options.productSelector);
        if(typeof isLeft !== 'undefined'){
            isLeft = !!isLeft;
        }else{
            isLeft = true;
        }
        //目标图片索引
        var tempGoalIndex = Number(goalIndex);
        if(typeof goalIndex !== 'undefined' || isNaN(tempGoalIndex)){
            var tempIndex = self._productNum + self._showProductIndex;
            if(isLeft){
                tempIndex -= 4;//4张图片轮播
            }else{
                tempIndex ++;
            }
            tempGoalIndex = tempIndex%self._bannerNum;
        }else{
            tempGoalIndex = tempGoalIndex%self._bannerNum;
        }
        console.log('====> ', tempGoalIndex);
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
