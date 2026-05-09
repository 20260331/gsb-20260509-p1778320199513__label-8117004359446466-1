3.2 交付方式

启动方式
项目必须支持通过以下命令完成启动：
docker compose up
- 不允许额外参数
- 不允许手动修改配置或环境变量
- 不依赖本地语言运行环境

容器化要求
- 所有运行依赖必须通过 Docker / docker-compose 显式声明
- 不得依赖本地服务、私有资源或公司内网
- 若包含数据库或中间件，必须一并容器化

对于全栈（Full Stack）题目：
- 必须使用 docker-compose 编排。
- Frontend：必须映射端口（如 3000），且配置好 Nginx 或开发服务器。
- Backend：必须在容器内完成依赖安装（pip install / mvn package 等）。
- Database：如果使用了 MySQL/Redis，必须在 compose 文件中定义对应的 Service，并且使用卷进行数据持久化,保证每一次重新启动数据都可以记录,严禁使用连接本地 localhost 数据库的配置。

针对全栈（Full Stack）题目，我的强烈建议是：必须把前端、后端、数据库全部放在 Docker 里（All-in-one）。

如果只放后端和数据库，不能算作真正的“一键运行”和“环境解耦”

全放进去：QA 输入 docker-compose up -> 浏览器打开 localhost:3000 -> 验收通过。
只放后端：QA 输入 docker-compose up 启动后端 -> 再打开一个终端 -> cd frontend -> npm install -
> npm start -> 等待编译 -> 打开浏览器。这极其繁琐，不符合“高效验收”的标准。
标准的 docker-compose.yml 结构，docker-compose.yml 应该至少包含 3 个服务：
代码块
2
3 services:
4 # 1. 数据库服务 (Database)
5 db:
6 image: mysql:8.0
7 environment:
8 MYSQL_ROOT_PASSWORD: root
9 ports:
10 - "3306:3306"
11
12 # 2. 后端服务 (Backend)
13 backend:
14 build: ./backend # 后端代码目录
15 ports:
16 - "8000:8000"
17 depends_on:
18 - db
19 environment:
20 DB_HOST: db # 关键：连接数据库必须用服务名，不能用 localhost
21
22 # 3. 前端服务 (Frontend) - 必须要有这个!
23 frontend:
24 build: ./frontend # 前端代码目录
25 ports:
26 - "3000:3000" # 映射端口供 QA 访问
27 depends_on:
28 - backend
29 # 可以在这里定义开发命令，或者在 Dockerfile 里写好
30 command: npm start

Docker镜像配置
代码块
{
  "builder": {
    "gc": {
      "defaultKeepStorage": "20GB",
      "enabled": true
    }
  },
  "experimental": false,
  "features": {
    "buildkit": true
  },
  "registry-mirrors": [
    "https://docker.m.daocloud.io",
    "https://mirror.ccs.tencentyun.com"
  ]
}
服务暴露与端口
• 项目启动后，必须至少提供一个可对外访问的服务
• 端口号不强制统一，但必须：
  ◦ 在 docker-compose 中显式暴露
  ◦ 在 README 中明确声明访问地址


  README 约定
README 中必须包含类似于：
代码块
1  ## How to Run
2  docker compose up
3
4  ## Services
5  - service_name: http://localhost:port
6
7  ## Verification
8  - 基本验证方式

README 内容需与实际行为一致。

3.3 验收标准
项目视为可验收，需同时满足：
1. 可通过 docker compose up 启动
2. 启动过程无需人工干预
3. 验证者无需阅读源码即可完成基本验证
4. 总结就一句话，需要与github高星项目一致，开箱即用