var pageContentArea={
    _options:{
        parentSelector: '.content-area',//父容器的选择器
        //banner图
        categoryBannerContainerSelector: '.js-category-banner-container',//栏目模板容器选择器
        categoryBannerTemplateId: 'js-category-banner',//栏目banner图模板id
        //二级导航
        secondCategoryContainerSelector: '.js-second-category-container',//二级导航的容器
        secondCategoryTemplagteId: 'js-second-category',//二级导航的模板id
        secondCategorySelectedClass: 'second-selected',//二级菜单被选中的class
        newsNameSelector: '.js-news-name',//新闻名称标题选择器

        //二级导航的内容
        secondCategoryContentContainerSelector: '.js-second-category-content-container',//二级导航内容的容器
        secondCategoryContentTemplagteId: 'js-second-category-content',//二级导航的模板id

        aboutCategoryDataName: 'aboutCategoryData',//保持栏目数据的名字（用在仓库中）
        contentAreaDetailDataName: 'contentAreaData',//保持栏目文章数据的名字（用在仓库中）
    },

    $parent: null,//父类 jquery对象
    showCategoryData: null,//显示的栏目数据
    showCategoryIndex: 0,//显示的栏目的索引
    newsId: 0,//新闻id

    _mergeOptions: function(options){
        var self = this;
        Object.assign(self._options, options);
    },
    _initData: function(){
        var self = this;
        //检查依赖，并抛出异常（不需要在本类初始化的类）
        if(typeof commonEnv !== 'object' || commonEnv === null){
            throw new Error('commonEnv是index.js依赖的对象，环境类（从./common.js中导入）');
        }
        if(typeof storage !== 'object' || storage === null){
            throw new Error('storage是index.js依赖的对象，仓库变量（从./storage.js中导入）');
        }
        if(typeof commonPage !== 'object' || commonPage === null){
            throw new Error('commonPage是index.js依赖的对象，公共页面对象（./js/common-page.js导入）');
        }
        if((typeof template !== 'object' && typeof template !== 'function')|| template === null){
            throw new Error('template是index.js依赖的对象，模板替代类（./assets/template-web.js导入）');
        }
        if(typeof server !== 'object' || server === null){
            throw new Error('server是index.js依赖的对象，服务类（从 ./server.js中导入）');
        }

        //初始基本对象
        self.$parent = $(self._options.parentSelector);

        //获取所选栏目
        var c = window.location.href.replace(/.*?#c=(\d+)$/, '$1');
        c = parseInt(c);
        if(isNaN(c)){
            c = commonTools.getRequestParam('c');
            c = parseInt(c);
        }
        self.showCategoryIndex = isNaN(c)?0:c;
        //新闻id
        var newsId =  commonTools.getRequestParam('id');
        newsId = parseInt(newsId);
        if(isNaN(newsId)){
            window.history.go(-1);
        }else{
           self.newsId = newsId; 
        }

        //添加语言监控类（为了保持数据的最新，只有栏目、碎片数据做了缓存，其他数据根据语言变化获取最新的数据）
        commonEnv.addListenLanguageChange(function(language){
            //设置栏目的信息
            self._setCategoryData();
        });

        //获取栏目数据（按照兄弟节点获取）
        server.getCategorysByOrConditon({
            pid: 12,
            id: 12
        }, function(res){
            if(res.status === 1){
                storage.set(self._options.aboutCategoryDataName, res.data[0]);
                //设置栏目的信息
                self._setCategoryData();
            }else{
                alert('数据异常');
            }
        });
    },
    //设置栏目的信息
    _setCategoryData: function(){
        var self = this;
        var categoryData = storage.get(self._options.aboutCategoryDataName);
        if(typeof categoryData === 'object' && categoryData !== null){
            //填充栏目图
            self.$parent.find(self._options.categoryBannerContainerSelector).html(template(self._options.categoryBannerTemplateId, {categoryImgUrl: categoryData.thumb}));

            //填充二级导航（地址栏）
            self.$parent.find(self._options.secondCategoryContainerSelector).html(template(self._options.secondCategoryTemplagteId, {
                categorysList: categoryData._child, 
                layoutData: storage.get('layoutData')
            }));

            //模拟点击栏目进行选中
            self._selectSecondCategory(self.showCategoryIndex);
        }else{
            console.log(self._options.aboutCategoryDataName + '栏目信息读取失败');
        }
    },

    _initEven: function(){
        var self = this;

        //从地址栏获取选中的栏目
        self.$parent.find(self._options.secondCategoryContainerSelector).off('click').on('click', 'span', function(){
            var $this = $(this);
            self._selectSecondCategory($this.data('index'));
        });

    },
    //选中二级栏目
    _selectSecondCategory: function(index){
        var self = this;
        var selectedClass = self._options.secondCategorySelectedClass;
        index = parseInt(index);
        var secondCategoryList = self.$parent.find(self._options.secondCategoryContainerSelector).find('> a');
        if(isNaN(index) || index >= secondCategoryList.length || index < 0){
            index = 0;
        }
        secondCategoryList.each(function(){
            var $this = $(this);
            if(parseInt($this.data('index')) === index){
                $this.addClass(selectedClass).siblings().removeClass(selectedClass);
                window.location.href = (window.location.href.replace(/#c=\d*/, '') + '#c=' + index);
                //修改栏目显示数据
                self.showCategoryData = storage.get(self._options.aboutCategoryDataName)._child[index];
                //通过栏目数据，获取所在栏目的文章
                server.getArticleDetail({article_id: self.newsId},function(res){
                    if(res.status === 1){
                        storage.set(self._options.contentAreaDetailDataName, res.data);
                        //设置文章
                        self._fullArticle();
                    }else{
                        //window.history.go(-1);//id不存在
                        console.log('获取新闻失败，请检查');
                    }
                });
            }
        });
    },
    /* 填充内容 */
    _fullArticle: function(){
        var self = this;
        var data =  storage.get(self._options.contentAreaDetailDataName);
        self.$parent.find(self._options.newsNameSelector).html(data.title);
        self.$parent.find(self._options.secondCategoryContentContainerSelector).html(template(
            self._options.secondCategoryContentTemplagteId,{
                data: data
            })
        );
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
    pageContentArea.init();
});