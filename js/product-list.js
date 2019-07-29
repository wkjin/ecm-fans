var pageContentArea = {
    _options: {
        parentSelector: '.content-area',//父容器的选择器
        //banner图
        categoryBannerContainerSelector: '.js-category-banner-container',//栏目模板容器选择器
        categoryBannerTemplateId: 'js-category-banner',//栏目banner图模板id

        //二级导航
        secondCategoryContainerSelector: '.js-second-category-container',//二级导航的容器
        secondCategoryTemplagteId: 'js-second-category',//二级导航的模板id
        secondCategorySelectedClass: 'second-selected',//二级菜单被选中的class

        productCategoryContainerSelector: '.js-product-category-container',//产品类别的容器
        productCategoryTemplagteId: 'js-product-category',//产品类别的模板id

        //产品搜索条件
        searchProductContainerSelector: '.js-search-product-container',//容器
        searchProductTemplagteId: 'js-search-product',//模板id

        //搜索操作栏
        searchBarContainerSelector: '.js-search-product-handlebar-container',//容器
        searchBarTemplateId: 'js-search-product-handlebar',//模板id


        //二级导航的内容
        secondCategoryContentContainerSelector: '.js-second-category-content-container',//二级导航内容的容器
        secondCategoryContentTemplagteId: 'js-second-category-content',//二级导航的模板id

        aboutCategoryDataName: 'aboutCategoryData',//保持栏目数据的名字（用在仓库中）
        productListDataName: 'productListData',//保持栏目产品列表数据的名字（用在仓库中）
    },

    $parent: null,//父类 jquery对象
    showCategoryData: null,//显示的栏目数据
    showCategoryIndex: 0,//显示的栏目的索引

    //搜索条件
    searchCondition: {},//搜索的条件


    _mergeOptions: function (options) {
        var self = this;
        Object.assign(self._options, options);
    },
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
        if (typeof server !== 'object' || server === null) {
            throw new Error('server是index.js依赖的对象，服务类（从 ./server.js中导入）');
        }

        //初始基本对象
        self.$parent = $(self._options.parentSelector);

        //获取url中的搜索条件
        var frequency = commonTools.getRequestParam('frequency'),
            voltage = commonTools.getRequestParam('voltage'),
            power_category = commonTools.getRequestParam('power_category'),
            air_volume = commonTools.getRequestParam('air_volume'),
            impeller_diameter = commonTools.getRequestParam('impeller_diameter');
        if (frequency !== null) {
            self.searchCondition['frequency'] = frequency;
        }
        if (voltage !== null) {
            self.searchCondition['voltage'] = voltage;
        }
        if (power_category !== null) {
            self.searchCondition['power_category'] = power_category;
        }
        if (air_volume !== null) {
            self.searchCondition['air_volume'] = air_volume;
        }
        if (frequency !== null) {
            self.searchCondition['impeller_diameter'] = impeller_diameter;
        }

        //获取所选栏目
        var c = window.location.href.replace(/.*?#c=(\d+)$/, '$1');
        c = parseInt(c);
        if (isNaN(c)) {
            c = commonTools.getRequestParam('c');
            c = parseInt(c);
        }
        self.showCategoryIndex = isNaN(c) ? -1 : c;

        //添加语言监控类（为了保持数据的最新，只有栏目、碎片数据做了缓存，其他数据根据语言变化获取最新的数据）
        commonEnv.addListenLanguageChange(function (language) {
            //设置栏目的信息
            self._setCategoryData();
        });

        //添加碎片监听事件（已经集成了语言变化）
        commonPage.addListenFragment(function (fragmentValueData, version, layoutData, fragmentData) {
            self._fullSearchArea(fragmentValueData, layoutData);//搜索添加变化
        });

        //获取栏目数据（按照兄弟节点获取）
        server.getCategorysByOrConditon({
            pid: 6,
            id: 6
        }, function (res) {
            if (res.status === 1) {
                storage.set(self._options.aboutCategoryDataName, res.data[0]);
                //设置栏目的信息
                self._setCategoryData();
            } else {
                alert('数据异常');
            }
        });
    },
    //设置栏目的信息
    _setCategoryData: function () {
        var self = this;
        var categoryData = storage.get(self._options.aboutCategoryDataName);
        if (typeof categoryData === 'object' && categoryData !== null) {
            //填充栏目图
            self.$parent.find(self._options.categoryBannerContainerSelector).html(template(self._options.categoryBannerTemplateId, { categoryImgUrl: categoryData.thumb }));

            //填充二级导航（地址栏）
            self.$parent.find(self._options.secondCategoryContainerSelector).html(template(self._options.secondCategoryTemplagteId, {
                categorysList: categoryData._child,
                layoutData: storage.get('layoutData')
            }));

            //填充产品类别
            self.$parent.find(self._options.productCategoryContainerSelector).html(template(self._options.productCategoryTemplagteId, {
                categorysList: categoryData._child,
                layoutData: storage.get('layoutData')
            }));

            //模拟点击栏目进行选中
            self._selectSecondCategory(self.showCategoryIndex);
        } else {
            console.log(self._options.aboutCategoryDataName + '栏目信息读取失败');
        }
    },
    //搜索添加变化
    _fullSearchArea: function (fragmentValueData, layoutData) {
        var self = this;
        //填充产品类别
        self.$parent.find(self._options.searchProductContainerSelector).html(template(self._options.searchProductTemplagteId, {
            impellerDiameterArr: commonPage.splitFragment('impeller_diameter', '|', layoutData.pleaseSelect),
            airVolumeArr: commonPage.splitFragment('air_volume', '|', layoutData.pleaseSelect),
            powerCategoryArr: commonPage.splitFragment('power_category', '|', layoutData.pleaseSelect),
            voltageArr: commonPage.splitFragment('voltage', '|', layoutData.pleaseSelect),
            frequencyArr: commonPage.splitFragment('frequency', '|', layoutData.pleaseSelect),
            atmosphericPressureArr: commonPage.splitFragment('atmospheric_pressure', '|', layoutData.pleaseSelect),
            speedArr: commonPage.splitFragment('speed', '|', layoutData.pleaseSelect),
            phaseNumberArr: commonPage.splitFragment('phase_number', '|', layoutData.pleaseSelect),
            specificationsArr: commonPage.splitFragment('specifications', '|', layoutData.pleaseSelect),
            layoutData: layoutData,
            condition: self.searchCondition
        }));
        //搜索栏
        self.$parent.find(self._options.searchBarContainerSelector).html(template(self._options.searchBarTemplateId, {
            layoutData: layoutData
        }));

    },

    _initEven: function () {
        var self = this;

        //从地址栏获取选中的栏目
        self.$parent.find(self._options.secondCategoryContainerSelector).off('click').on('click', 'span', function () {
            var $this = $(this);
            self._selectSecondCategory($this.data('index'));
        });

        //搜素按钮
        self.$parent.find(self._options.searchBarContainerSelector).off('click').on('click', 'a[data-handle]', function (e) {
            e.preventDefault();
            var $this = $(this);
            var handle = $this.data('handle');
            if (handle === 'search') {

            } else if (handle === 'searchAll') {
                window.location.href = self.showCategoryData.url;
            } else {
                console.log('没有绑定处理');
            }
        });

    },
    //选中二级栏目
    _selectSecondCategory: function (index) {
        var self = this;
        var selectedClass = self._options.secondCategorySelectedClass;
        index = parseInt(index);
        var secondCategoryList = self.$parent.find(self._options.secondCategoryContainerSelector).find('> a');
        if (isNaN(index) || index >= secondCategoryList.length || index < 0) {
            //留到最后做统一处理
        }else{
            var $selected = self.$parent.find(self._options.secondCategoryContainerSelector).find('> a[data-index="'+index+'"]');
            if($selected.length > 0){
                self.showCategoryIndex = index;//保存使用的栏目索引
                $selected.addClass(selectedClass).siblings().removeClass(selectedClass);
                window.location.href = (window.location.href.replace(/#c=\d*/, '') + '#c=' + index);
                //修改栏目显示数据
                self.showCategoryData = storage.get(self._options.aboutCategoryDataName)._child[index];
                var categoryId = self.showCategoryData['id'];
                self.$parent.find('.js-category-item[data-id="'+categoryId+'"]').attr('selected', true);
                //通过栏目数据，获取所在栏目的文章
                self.getProductContent(categoryId);
                return;
            }
        }
        //如果没有选中的栏目就是获取所有的产品列表
        self.showCategoryIndex = -1;//保存使用的栏目索引
        self.$parent.find('.js-last-angle').hide();
        self.getProductContent();
    },

    //获取产品内容
    getProductContent: function (category_id) {
        var self = this;
         //通过栏目数据，获取所在栏目的文章
         server.getProducts(Object.assign({
            category_id: category_id
        }, self.searchCondition), function (res) {
            if (res.status === 1) {
                storage.set(self._options.productListDataName, res.data);
                //设置文章
                self._fullProductList();
            } else {
                console.log('获取产品列表失败，请检查');
            }
        });
        return self;
    },

    /* 填充内容 */
    _fullProductList: function () {
        var self = this;
        var data = storage.get(self._options.productListDataName);
        self.$parent.find(self._options.secondCategoryContentContainerSelector).html(template(
            self._options.secondCategoryContentTemplagteId, {
                data: data,
                layoutData: storage.get('layoutData'),
                categoryIndex: self.showCategoryIndex
            })
        );
    },

    _initEnd: function () {
        var self = this;
    },
    init: function (options) {
        var self = this;
        self._mergeOptions(options);
        self._initData();
        self._initEven();
        self._initEnd();
    }
};

$(function () {
    pageContentArea.init();
});