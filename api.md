## https://bj.zhue.com.cn/search_list.php 平台
### 查询省
>GET http://192.168.1.52:8000/getProvince
### 查询市
>GET http://192.168.1.52:8000/getCity?province_id=20 {province_id:省份id}
### 查询区
>GET http://192.168.1.52:8000/getCounty?city_id=2012 {city_id:市id}
### 查询品类
>GET http://192.168.1.52:8000/getCategory
### 查询商品所在的省市县
>GET http://127.0.0.1:8000/getCommodityCity 待定
### 更新品类
>GET http://192.168.1.52:8000/updateCategory
### 添加
> POST http://192.168.1.52:8000/addCommodity {"province_id":"省","city_id":"市","county_id":"县","categroy_id":"商品"}
### 删除 
> DELETE "DELETE" "http://192.168.1.52:8000/deleteCommodity/042ade4f-2218-4c00-bd5a-75d6f8b971e3" 把路径上id换成列表的categroy_id
### 查询
> GET curl http://192.168.1.52:8000/getCommodity?page_size=1&page_number=100  {
page_size: '1',
    page_number: '100',
    start_time: '1970-01-01',起始
    end_time: '2023-01-16',结束
    province_id: '省',
    city_id: '市',
    county_id: '县',
    categroy_id: '品类'
  }
### 查询详情 
> GET http://192.168.1.52:8000/viewCommodity?page_number=200&province_id=1&city_id=3136&county_id=113&categroy_id=40&create_date=创建时间 {release_price:价格筛选}
### 删除详情
> DELETE http://localhost:8000/deleteViewCommodity/:id 

