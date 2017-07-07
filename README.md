# 浏览器插件————todo list

## 自定义模版引擎

1. 实现原理
    将自定义类型的script标签中的字符串拼接为可执行的语句字符串，在通过eval（该模版中，自定义函数实现eval功能）执行该字符串，在全局注入一个globalStr变量，存放对应生成对应文档结构，在通过innerHTML将该结构添加到指定的元素上

2. 自定义模版引擎格式
    1. 赋值 {{data}}
    2. 判断 {{if(...) { }} {{ } else if(...) { }} {{else}} {{ } }}
    3. 对象 {{for(key in object) { }} {{ } }}
    4. 数组 {{for(var i = 0); i < arrays.length; ++i) { }} {{ } }}
    5. 设置样式class，允许使用三元运算符 
        <li class="{{data.todos[i].isRed ? green : yellow}}">{{data.todos[i].todo_name}}</li>
        多个class，可以写多的{{}},但是注意中间需要有空格；
        也可以在一个三元运算符中嵌套三元运算符，如{{data.todos[i].isRed ? data.todos[i].isGreen ? green : blue : yellow}} 

3. 使用方法
     1. 将模版引擎文件template.js引入到页面：将在页面中注入一个template全局对象，其中包括complileTpl和executeTpl两个公共方法。其中complileTpl接受一个id,将指定标签中的内容编译成可执行js语句字符串；executeTpl接受id,data，使用data渲染模版，并挂在到指定id的标签下
        如：
            <script src="utils/template.js"></script>

     2. 在页面中定义模版：使用script标签定义模版，将type设置为text/my_template，防止自动执行脚本，报错！
        如：
        <script id="test_template" type="text/my_template">
            <ul>
                {{for(var i = 0; i < data.todos.length; ++i) { }}
                    {{if(data.todos[i].todo_type) { }}
                        <li class="{{data.todos[i].isRed ? green : yellow}} {{data.todos[i].isRed ? green : yellow}}">{{data.todos[i].todo_name}}</li>
                    {{ } }}
                {{ } }}
            </ul>
        </script>

     3. 调用complileTpl：传入模版所在的script标签的id，将模版中的字符串解析成可执行的字符串（可被eval函数执行）
        如：
        template.complileTpl('test_template');

     4. 调用executeTpl：传入将要挂载的标签的id和要渲染的数据data，将解析后的页面结构挂载到指定标签上
        如：
        template.executeTpl('test', data);

     5. 其他：可以在将complileTpl，executeTpl在同一行进行调用。
        如：
        template.complileTpl('test_template').executeTpl('test', data);

4. 示范
 ```
    /*  解析前
        <ul>
            {{for(var i = 0; i < data.todos.length; ++i) { }}
                {{if(data.todos[i].todo_type) { }}
                    <li class="{{data.todos[i].isRed ? green : yellow}} {{data.todos[i].isRed ? green : yellow}}">{{data.todos[i].todo_name}}</li>
                {{ } }}
            {{ } }}
        </ul>
     */
    
    /*  解析后
        var globalStr = '';
        globalStr += '<ul>';
        for (var i = 0; i < data.todos.length; ++i) {
            if (data.todos[i].todo_type) {
                globalStr += '<li class="';
                data.todos[i].isRed ? globalStr += 'green' : globalStr += 'yellow';
                globalStr += ' ';
                data.todos[i].isRed ? globalStr += 'green' : globalStr += 'yellow';
                globalStr += '">';
                globalStr += data.todos[i].todo_name;
                globalStr += '</li>';
            }
        }
        globalStr += '</ul>';
     */
    
    /*  执行后
        <ul>
            <li class="green green">eat</li>
            <li class="green green">sleep</li>
            <li class="yellow yellow">play</li>
        </ul>
     */
 ```

5. _replaceEval，利用script标签添加到页面，脚本自动执行的特性，取代eval函数

































