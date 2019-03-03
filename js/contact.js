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
        //二级导航的内容
        secondCategoryContentContainerSelector: '.js-second-category-content-container',//二级导航内容的容器
        secondCategoryContentTemplagteId: 'js-second-category-content',//二级导航的模板id

        pageCategoryDataName: 'aboutCategoryData',//保持栏目数据的名字（用在仓库中）
        pageCategoryArticleDataName: 'pageCategoryArticleData',//保持栏目文章数据的名字（用在仓库中）

        mapContainerID: 'map-content',//地图容器的id

        onlineMessageFormSelector: '#online-message-form',//留言form选择器
    },

    $parent: null,//父类 jquery对象
    showCategoryData: null,//显示的栏目数据
    showCategoryIndex: 0,//显示的栏目的索引
    isInformation: true,//是否是联系方式栏目

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

        //添加语言监控类（为了保持数据的最新，只有栏目、碎片数据做了缓存，其他数据根据语言变化获取最新的数据）
        commonEnv.addListenLanguageChange(function(language){
            //设置栏目的信息
            self._setCategoryData();
        });

        //获取栏目数据（按照兄弟节点获取）
        server.getCategorysByOrConditon({
            pid: 21,
            id: 21
        }, function(res){
            if(res.status === 1){
                storage.set(self._options.pageCategoryDataName, res.data[0]);
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
        var categoryData = storage.get(self._options.pageCategoryDataName);
        if(typeof categoryData === 'object' && categoryData !== null){
            //填充栏目图
            self.$parent.find(self._options.categoryBannerContainerSelector).html(template(self._options.categoryBannerTemplateId, {categoryImgUrl: categoryData.thumb}));

            //填充二级导航
            self.$parent.find(self._options.secondCategoryContainerSelector).html(template(self._options.secondCategoryTemplagteId, {categorysList: categoryData._child}));

            //模拟点击栏目进行选中
            self._selectSecondCategory(self.showCategoryIndex);
        }else{
            console.log(self._options.pageCategoryDataName + '栏目信息读取失败');
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
        var secondCategoryList = self.$parent.find(self._options.secondCategoryContainerSelector).find('> span');
        if(isNaN(index) || index >= secondCategoryList.length || index < 0){
            index = 0;
        }
        secondCategoryList.each(function(){
            var $this = $(this);
            if(parseInt($this.data('index')) === index){
                $this.addClass(selectedClass).siblings().removeClass(selectedClass);
                window.location.href = (window.location.href.replace(/#c=\d*/, '') + '#c=' + index);
                //修改栏目显示数据
                self.showCategoryData = storage.get(self._options.pageCategoryDataName)._child[index];
                //通过栏目数据，获取所在栏目的文章
                if(index === 0){//是获取联系方式时候才获取栏目下面的文章
                    self.isInformation = true;//是否联系方式页面
                    server.getArticleDetail({category_id: self.showCategoryData['id']},function(res){
                        if(res.status === 1){
                            storage.set(self._options.pageCategoryArticleDataName, res.data);
                            //设置文章
                            self._fullSecondContent();
                        }else{
                            console.log('获取栏目文章失败，请检查');
                        }
                    });
                }else{
                    self.isInformation = false;//是否联系方式页面
                    setTimeout(function(){
                        self._fullSecondContent();
                        //绑定事件
                        self.$parent.find(self._options.onlineMessageFormSelector).off('submit').on('submit', function(e){
                            $(this).attr('action', (server._options.host + server._options.sendOnlineMessageUrl));
                            /* e.preventDefault();
                            var data = $(this).serialize();
                            server.sendOnlineMessage(data, function(res){
                                alert(res.message);
                            }); */
                        });
                    }, 200);
                }
            }
        });
    },
    /* 填充内容 */
    _fullSecondContent: function(){
        var self = this;
        var data =  storage.get(self._options.pageCategoryArticleDataName);
        self.$parent.find(self._options.secondCategoryContentContainerSelector).html(template(self._options.secondCategoryContentTemplagteId, {
            agent: data,
            layoutData: storage.get('layoutData'),
            fragmentData: storage.get('fragmentData'),
            isInformation: self.isInformation
        }));
        if(self.isInformation){
            self.loadBaiduMap();
        }
    },
    //调用地图进行初始化地图，并设置地图
    loadBaiduMap: function(){
        var self = this;
        var layoutData = storage.get('layoutData');
        var fragmentData = storage.get('fragmentData');
        var mapContainerID = self._options.mapContainerID;
        var zoom = 18;
        var points = fragmentData.company_latitude_longitude.value;
    	var markerArr = [
	    	{
	    		title: fragmentData.company_name.value,
	    		content: layoutData.telephone + "：" + fragmentData.telephone.value,
	    		point: points,
	    		isOpen:0,
	    		icon:{w:21,h:21,l:0,t:0,x:6,lb:5}
	    	}
		];//标注点数组
        var map = new BMap.Map(mapContainerID);//在百度地图容器中创建一个地图
        var point = new BMap.Point(...points.split('|'));//定义一个中心点坐标
        map.centerAndZoom(point, zoom);//设定地图的中心点和坐标并将地图显示在地图容器中

        //地图控件添加函数：
        map.addControl(new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE}));
		map.addControl(new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1}));
		map.addControl(new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT}));

		//地图事件设置函数：
	    map.enableDragging();
	    map.enableScrollWheelZoom();
	    map.enableDoubleClickZoom();
	    map.enableKeyboard();

	    //向地图中添加marker
	    var createInfoWindow = function(i){//创建InfoWindow
	        var json = markerArr[i];
	        return new BMap.InfoWindow("<b class='iw_poi_title' title='" + json.title + "'>" + json.title + "</b><div class='iw_poi_content'>"+json.content+"</div>");
	    }
	    var createIcon = function(json){//创建一个Icon
	        return new BMap.Icon("http://map.baidu.com/image/us_mk_icon.png", new BMap.Size(json.w,json.h),{imageOffset: new BMap.Size(-json.l,-json.t),infoWindowOffset:new BMap.Size(json.lb+5,1),offset:new BMap.Size(json.x,json.h)})
	    }
	    //变量生成标注
	    for(var i=0;i<markerArr.length;i++){
            var json = markerArr[i];
            var p0 = json.point.split("|")[0];
            var p1 = json.point.split("|")[1];
            var point = new BMap.Point(p0,p1);
			var iconImg = createIcon(json.icon);
            var marker = new BMap.Marker(point,{icon:iconImg});
			var iw = createInfoWindow(i);
			var label = new BMap.Label(json.title,{"offset":new BMap.Size(json.icon.lb-json.icon.x+10,-20)});
			marker.setLabel(label);
            map.addOverlay(marker);
            label.setStyle({
                borderColor:"#808080",
                color:"#333",
                cursor:"pointer"
            });
				
			var _iw = createInfoWindow(i);
			marker.addEventListener("click",function(){
			    this.openInfoWindow(_iw);
		    });
		    _iw.addEventListener("open",function(){
			    marker.getLabel().hide();
		    })
		    _iw.addEventListener("close",function(){
			    marker.getLabel().show();
		    })
			label.addEventListener("click",function(){
			    marker.openInfoWindow(_iw);
		    })
			if(!!json.isOpen){
				label.hide();
				marker.openInfoWindow(_iw);
			}
        }
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