#/bin/bash

# 服务端 部署 docker 生成新的镜像
doc_ps=(`docker ps | grep node-market`);
doc_imgs=(`docker images | grep node-market`);

doc_ps_id=${doc_ps[0]};
doc_imgs_id=${doc_imgs[2]};

docker rm -f ${doc_ps_id};
docker rmi -f ${doc_imgs_id};

docker-compose up -d;

echo "docker ps "${doc_ps_id};
echo "docker images "${doc_imgs_id};
echo "重启成功！"
