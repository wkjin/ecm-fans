var indexPage = {
    _options: {
        parentSelector: '.content-area',//父容器的选择器

        //banner图部分
        bannerBodySelector: '.js-banner-swiper-body',//banner图body选择器
        bannerContainerSelector: '.js-banner-swiper-container',//banner图swiper的容器选择器
        bannerItemTemplateId: 'js-banner-swiper',//banner子项模板id

        //产品轮播图部分
        productCategoryTitleTemplateId: 'js-product-category-title',//产品栏目的标题模板id
        productContainerSelector: '.js-product-list',//产品展示图的容器
        productCategoryTitleContainer: '.js-product-category-title-container',//栏目标题容器
        productCategoryTemplateId: 'js-product-category',//产品栏目的模板id
        productCanMoveClass: 'product-can-move',//产品展示图可以移动的class
        productMovingClass: 'product-moving',//产品正在移动的class
        productShowSelector: '.product-show',//产品展示图显示的选择器
        productAnimateTime: 1500,//产品展示图的过渡动画时间（ms）
        productShowNum: 4,// 产品展示的数量
        productShowItemTag: 'a',//产品显示子项的tag名

        //浩沅课堂
        haoyuanClassroomTitleContainerSelector: '.js-haoyuan-classroom-title-container',
        haoyuanClassroomTitleTemplateId: 'js-haoyuan-classroom-title',
        haoyuanClassroomContainerSelector: '.js-haoyuan-classroom-container',
        haoyuanClassroomTemplateId: 'js-haoyuan-classroom',

        //新闻资讯
        newsTitleContainerSelector: '.js-news-title-container',//新闻咨询标题容器选择器
        newsTitleTemplateId: 'js-news-title',//新闻咨询标题模板id
        newsListContainerSelector: '.js-news-list-container',//新闻列表容器选择器
        newsListTemplateId: 'js-news-list',//新闻列表的模板id

        //首页栏目模块的公共类
        categoryCommonBlockSelector: '.js-category-block',

        //关于公司
        aboutCompanyInfoContainerSelector: '.js-company-info-container',
        aboutCompanyInfoTemplateId: 'js-company-info',//关于公司模板id

        imgSelector: 'img.lazy-load',//图片选择器

    },

    $parent: null,//父容器的对象

    //产品展示图
    _productNum: 0,//产品的数量
    _showProductIndex: 0,//显示产品的索引
    _productTimer: null,//product动画的计时器

    _bannerSwiper: null,//保存banner图的swiper实例

    loadingNum: 0,//正在加载的数量

    canLoadingTimer: null,//是否可以加载Timer
    lazyloadTimer: null,//懒加载
    lazyLoadNum: 0,//懒加载次数
    loadingImgNum: 0, //正在加载图片的数量


    _initData: function () {
        var self = this;

        //检查依赖，并抛出异常（不需要在本类初始化的类）
        if (typeof commonEnv !== 'object' || commonEnv === null) {
            throw new Error('commonEnv是index.js依赖的对象，环境类（从./common.js中导入）');
        }
        if (typeof storage !== 'object' || storage === null) {
            throw new Error('storage是index.js依赖的对象，仓库变量（从./storage.js中导入）');
        }
        if (typeof commonPage !== 'object' || commonPage === null) {
            throw new Error('commonPage是index.js依赖的对象，公共页面对象（./js/common-page.js导入）');
        }
        if ((typeof template !== 'object' && typeof template !== 'function') || template === null) {
            throw new Error('template是index.js依赖的对象，模板替代类（./assets/template-web.js导入）');
        }
        if ((typeof Swiper !== 'object' && typeof Swiper !== 'function') || Swiper === null) {
            throw new Error('Swiper是index.js依赖的对象，轮播图类（./assets/swiper.min.js导入）');
        }
        if (typeof server !== 'object' || server === null) {
            throw new Error('server是index.js依赖的对象，服务类（从 ./server.js中导入）');
        }

        //初始基本对象
        self.$parent = $(self._options.parentSelector);

        //添加语言监控类（为了保持数据的最新，只有栏目、碎片数据做了缓存，其他数据根据语言变化获取最新的数据）
        commonEnv.addListenLanguageChange(function (language) {
            self._fullHtmlGroup();
        });

        self._fullHtmlGroup();

        //添加布局监控
        commonPage.addListenLayout(function (layoutData, version) {
            self._fullProductTitle();//填充产品标题
            self._fullNewsTitle();//填充新闻资讯标题
            self._fullHaoyuanClassroomTitle();//填充浩沅课堂标题
        });

        //添加栏目监听事件
        commonPage.addListenCategory(function (data) {
            self.setIndexCategoryBlockVisible(data, 0);
        });

        //添加碎片监听事件（已经集成了语言变化）
        commonPage.addListenFragment(function (fragmentValueData, version, layoutData, fragmentData) {
            /* console.log(fragmentValueData, version, layoutData, fragmentData, '碎片变化监听'); */
            self._fullBanner();//banner图变化
            self._fullAboutCompany(fragmentValueData);//填充关于公司
        });

        //产品展示图
        self._productParentObj = $(self._options.productContainerSelector);
        self._productNum = self.$parent.find(self._options.productContainerSelector).find('> a').length;
    },

    //设置首页栏目模块显示隐藏
    setIndexCategoryBlockVisible: function (listData, p_id) {
        var self = this;
        p_id = parseInt(p_id);
        p_id = isNaN(p_id)?0:p_id;
        if (Array.isArray(listData) && listData.length > 0) {
            for (var i = 0, it = null; i < listData.length; i++) {
                it = listData[i];
                if (typeof it === 'object' && it !== null) {
                    var status = parseInt(it.status);
                    var $categoryBlock = self.$parent.find(self._options.categoryCommonBlockSelector + '[p-c-id="'+p_id+'"]' + '[c-id="'+it.id+'"]');
                    if( status === 1){
                        $categoryBlock.show();
                    }else{
                        $categoryBlock.hide();
                    }
                    if (it._child && Array.isArray(it._child) && it._child.length > 0) {
                        if(status === 1){
                            self.setIndexCategoryBlockVisible(it._child, it.id);
                        }
                    }
                } else {
                    console.error('获取栏目信息失败！！！');
                }
            }
        } else {
            console.error('数据为空，无法遍历');
        }
    },

    //填充html的组（语言变化，需要跟随变化）
    _fullHtmlGroup: function () {
        var self = this;
        self._fullProduct();//填充产品数据
        self._fullNewsList();//填充新闻资讯数据
        self._fullHaoyuanClassroom();//填充浩沅课堂
    },

    //生成banner图
    _fullBanner: function () {
        var self = this;
        self.$parent.find(self._options.bannerContainerSelector).html(template(self._options.bannerItemTemplateId, {
            bannerList: commonPage.splitFragment('home_broadcast', '|', '', false)
        }));
        if (self._bannerSwiper !== null) {
            self._bannerSwiper.destroy();//如果已经初始化过的，先销毁在重新初始化
        }

        self._bannerSwiper = new Swiper(self._options.bannerBodySelector, {
            autoplay: {
                delay: 10 * 1000,
            },
            pagination: {
                el: '.swiper-pagination',
                type: 'bullets',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            on: {
                init: function () {
                    //图片加载事件
                    self.$parent.find(self._options.bannerContainerSelector).find('img').off('load').on('load', function () {
                        $(this).attr('ready', true);//添加图片加载标记
                    }).off('error').on('error', function () {
                        $(this).attr('error', true);
                    });
                },
                click: function (index) {
                    /* console.log(arguments, index); */
                },
                slideChange: function () {
                    /*  console.log('change'); */
                }
            },
            speed: 1000,
            spaceBetween: 0,
            loop: true
        });

    },

    //填充产品栏目的标题
    _fullProductTitle: function () {
        var self = this;
        self.$parent.find(self._options.productCategoryTitleContainer).html(template(self._options.productCategoryTitleTemplateId, {
            layoutData: storage.get('layoutData')
        }));
    },
    //生成产品轮播图
    _fullProduct: function () {
        var self = this;
        self.loadingNum++;
        server.getCategorysByCondition({ pid: 6, is_index: 1 }, function (res) {
            self.loadingNum--;
            if (res.status === 1) {//获取数据成功
                var productCategoryName = 'productCategoryList';
                storage.set(productCategoryName, res.data, false);
                self.$parent.find(self._options.productContainerSelector).html(template(self._options.productCategoryTemplateId, {
                    productCategoryList: storage.get(productCategoryName)
                }));
                //记录条数
                self._productNum = self.$parent.find(self._options.productContainerSelector).find('> a').length;
                //生产产品展示的轮播图
                setTimeout(function () {
                    self._generateProductShow();
                }, 500);
            } else {
                console.error(res.message);
            }
        });
    },
    //生成产品展示图的轮播
    _generateProductShow: function () {
        var self = this;
        var parentObj = self.$parent.find(self._options.productContainerSelector);
        //根据数量放在不同的product-show进行待显示与显示

        //把前面四张产品图放在显示的div中
        var html = '<div class="' + self._options.productShowSelector.replace(/\./, '') + '"></div>';
        var showObj = $(html);
        var cloneFirstImg = parentObj.find('> a:lt(4)');
        self._showProductIndex = cloneFirstImg.length - 1;
        showObj.html(cloneFirstImg.clone());
        parentObj.prepend(showObj);
        parentObj.addClass(self._options.productCanMoveClass);
    },

    //新闻资讯标题
    _fullNewsTitle: function () {
        var self = this;
        self.$parent.find(self._options.newsTitleContainerSelector).html(template(self._options.newsTitleTemplateId, {
            layoutData: storage.get('layoutData')
        }));
    },
    //新闻资讯内容
    _fullNewsList: function () {
        var self = this;
        self.loadingNum++;
        server.getArticles({ category_id: 13, pageSize: 8 }, function (res) {
            self.loadingNum--;
            if (res.status === 1) {//获取数据成功
                var newsListName = 'indexNewsList';
                storage.set(newsListName, res.data, false);
                var newsData = storage.get(newsListName);
                self.$parent.find(self._options.newsListContainerSelector).html(template(self._options.newsListTemplateId, {
                    newsList1: newsData.slice(0, 4),
                    newsList2: newsData.slice(4, 8),
                    news_thumb: storage.get('fragmentData').news_thumb.value
                }));
            } else {
                console.error(res.message);
            }
        });
    },

    //浩沅课堂
    _fullHaoyuanClassroomTitle: function () {
        var self = this;
        self.$parent.find(self._options.haoyuanClassroomTitleContainerSelector).html(template(self._options.haoyuanClassroomTitleTemplateId, {
            layoutData: storage.get('layoutData')
        }));
    },
    _fullHaoyuanClassroom: function () {
        var self = this;
        self.loadingNum++;
        server.getArticles({ category_id: 14, pageSize: 9 }, function (res) {
            self.loadingNum--;
            if (res.status === 1) {//获取数据成功
                var haoyuanClassroomName = 'indexHaoyuanClassroom';
                storage.set(haoyuanClassroomName, res.data, false);
                var haoyuanClassroom = storage.get(haoyuanClassroomName);
                self.$parent.find(self._options.haoyuanClassroomContainerSelector).html(template(self._options.haoyuanClassroomTemplateId, {
                    haoyuanClassroom: haoyuanClassroom
                }));
            } else {
                console.error(res.message);
            }
        });
    },

    //填充关于公司
    _fullAboutCompany: function (fragmentData) {
        var self = this;
        setTimeout(function () {
            self.$parent.find(self._options.aboutCompanyInfoContainerSelector).html(template(self._options.aboutCompanyInfoTemplateId, {
                fragmentData: fragmentData
            }));
        }, 500);
    },

    _initEven: function () {
        var self = this;

        //产品图片展示
        //绑定产品图的点击事件
        self.$parent.find(self._options.productContainerSelector).off('click').on('click', function (e) {
            // var $this = $(this);
            var $this = self.$parent.find(self._options.productContainerSelector);
            var tagName = e.target.tagName;
            if (tagName === 'IMG' || tagName === 'A') {
                // alert('点击的是图片');
                // e.preventDefault();
                return;
            } else {//不是点击在图片上
                e.stopPropagation();
                var fontWidth = 36;
                var width = $this.width();
                var height = $this.height();
                var offsetY = e.offsetY;
                var targetArea = (height - fontWidth) / 2;
                //点击在左右箭头上
                if (offsetY >= targetArea && offsetY <= (targetArea + fontWidth)) {
                    //查找到显示的product-show与等待显示的div
                    // 查找到产品正在显示的div
                    var productShowSelector = self._options.productShowSelector;
                    var productShowNum = self._options.productShowNum;
                    var productShowObj = self.$parent.find(productShowSelector).not(':hidden');

                    //查看是否已经生成等待显示的div（如果没有，就创建，如果有了以后就直接改变图片的地址）
                    var productHiddenObj = self.$parent.find(productShowSelector + ':hidden');
                    //开始移动
                    if (productShowObj.is(":animated")) {    //判断元素是否正处于动画状态
                        //如果当前没有进行动画，则添加新动画
                        return;
                    }
                    if (typeof productHiddenObj === 'undefined' || productHiddenObj.length <= 0) {//如果不存在，那么就创建
                        productShowObj.after(productShowObj.clone().hide());
                        productHiddenObj = self.$parent.find(productShowSelector + ':hidden');
                    }
                    var startIndex = self._productNum * 4 + self._showProductIndex;
                    var isLeft = true;//是否先左边
                    if (e.offsetX <= fontWidth) {//点击左箭头
                        startIndex -= productShowNum;
                        isLeft = true;
                    } else if (e.offsetX >= (width - fontWidth)) {//点击右箭头
                        startIndex++;
                        isLeft = false;
                    } else {
                        return;
                    }
                    //进行图片地址更改
                    productHiddenObj.html('');
                    for (var i = 0; i < productShowNum; i++) {
                        var selector = '> ' + self._options.productShowItemTag;
                        productHiddenObj.append(
                            $this.find(selector).eq((startIndex + i) % self._productNum).clone()
                        );
                    }
                    self._showProductIndex = (productShowNum + self._showProductIndex) % self._productNum;
                    self._changeProduct(function () {
                        //移动完毕

                    }, isLeft);
                    return;
                }
            }
        });
    },

    //product切换
    _changeProduct: function (callback, isLeft) {
        var self = this;
        var productContainerObj = self.$parent.find(self._options.productContainerSelector);
        if (typeof isLeft !== 'boolean') {
            isLeft = !!isLeft;
        }
        var animateTime = self._options.productAnimateTime;
        var productShowSelector = self._options.productShowSelector;
        //查看显示图片的div
        var productShowObj = self.$parent.find(productShowSelector).not(':hidden');

        //查看不显示图片的div
        var productHiddenObj = self.$parent.find(productShowSelector + ':hidden');
        if (isLeft) {
            productHiddenObj.css({ left: '100%' }).show().animate({ left: '0%' }, animateTime, function () {
                if (typeof callback === 'function') {
                    callback();
                }
            });
            productShowObj.animate({ left: '-100%' }, animateTime, function () {
                $(this).hide();
            });
        } else {
            productHiddenObj.css({ left: '-100%' }).show().animate({ left: '0%' }, animateTime, function () {
                if (typeof callback === 'function') {
                    callback();
                }
            });
            productShowObj.animate({ left: '100%' }, animateTime, function () {
                $(this).hide();
            });
        }

    },

    _initEnd: function () {
        var self = this;
        var lazyLoadClass = 'lazy-load';
        var lazyLoadImgDataAttr = 'original';//懒加载图片的data属性
        var indexBannerImgClass = 'js-index-banner';//首页banner轮播图
        var emptyImg = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAMSURBVBhXY/j//z8ABf4C/qc1gYQAAAAASUVORK5CYII=';
        self.canLoadingTimer = setInterval(function () {
            if (self.loadingNum <= 0) {
                startLazyLoadImg();
                clearInterval(self.canLoadingTimer);
                self.canLoadingTimer = null;
            }
        }, 500);

        //开始懒加载图片
        function startLazyLoadImg() {
            self.lazyloadTimer = setInterval(function () {
                if (self.lazyLoadNum > 100) {
                    clearInterval(self.lazyloadTimer);
                } else {
                    self.lazyLoadNum++;
                    //对首页的banner图进行优先处理
                    var $indexBanner = $('.' + indexBannerImgClass + ':not([ready])');
                    if ($indexBanner.length > 0) {//banner图优秀加载
                        $indexBanner.off('error').on('error', function () {
                            $(this).removeClass(indexBannerImgClass).attr('src', emptyImg);//如果懒加载错误就使用空白图片
                        }).on('load', function () {
                            $(this).removeClass(indexBannerImgClass);
                        });
                        return;//如果在加载banner图时候停止加载其他的图片
                    }
                    if (self.loadingImgNum <= 0) {
                        $('.' + lazyLoadClass + '[data-' + lazyLoadImgDataAttr + ']:lt(10)').off('error').on('error', function () {
                            $(this).off('load').attr('src', emptyImg);//如果懒加载错误就使用空白图片
                            self.loadingImgNum--;
                        }).off('load').on('load', function () {
                            self.loadingImgNum--;//加载图片成功
                        }).each(function () {
                            var $this = $(this);
                            self.loadingImgNum++;
                            var src = $this.data(lazyLoadImgDataAttr);
                            if (typeof src === 'string' && src.replace(/\s+/, '') !== '') {
                                $this.attr('src', src).removeClass(lazyLoadClass);
                            }
                        });
                    }
                }
            }, 1000);
        }
    },

    init: function () {
        var self = this;
        self._initData();
        self._initEven();
        self._initEnd();
    }
};
