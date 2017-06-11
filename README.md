# 浏览器插件————todo list

## 自定义模版引擎

1. 实现原理
    将自定义类型的script标签中的字符串拼接为可执行的语句字符串，在通过eval执行该字符串，生成对应文档结构，在通过innerHTML将该结构添加到指定的元素下面

2. 自定义模版引擎格式
    1. 赋值 {{data}}
    2. 判断 {{if(...) { }} {{ } else if(...) { }} {{else}} {{ } }}
    3. 对象 {{for(key in object) { }} {{ } }}
    4. 数组 {{for(var i = 0); i < arrays.length; ++i) { }} {{ } }}
    处理赋值以外，其他语句需要独占一行

3. 示范
 ```
    /*  解析前
            <ul>
                {{for(var i = 0; i < data.todos.length; ++i)}}
                    {{if(data.todos[i].todo_type)}}
                        <li>{{data.todos[i].todo_name}}</li>
                    {{/if}}
                {{/for}}
            </ul>
     */
    
    /*  解析后
        var str = "";
        str += "<ul>";
        for (var i = 0; i < data.todos.length; ++i) {
            if (data.todos[i].todo_type) {
                str += "<li>";
                str += data.todos[i].todo_name;
                str += "</li>";
            }
        }
        str += "</ul>";
     */
    
    /*  执行后
        <ul><li>eat</li><li>sleep</li><li>play</li></ul>
     */
 ```
