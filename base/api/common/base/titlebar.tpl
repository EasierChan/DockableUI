<!Doctype html>
<html lang="zh-CN">

<head>
    <title>Just do it</title>
    <style>
        * {
            margin: 0;
            padding: 0;
        }
        
        body {
            padding: 1px;
            overflow: hidden;
            background-color: rgb(39, 45, 49);
        }
        
        .hk-titlebar {
            -webkit-user-select: none;
            -webkit-app-region: drag;
            background-color: rgb(36, 37, 40);
            height: 30px;
            color: white;
        }
        
        .hk-titlebar > span.name {
            line-height: 30px;
            margin-left: 8px;
        }
        /*按钮*/
        
        .hk-btn-top {
            float: right;
            width: 35px;
            text-align: center;
            -webkit-app-region: no-drag;
            cursor: default;
        }
        
        a.hk-btn-top:hover {
            background-color: rgb(53, 58, 63);
        }

        a.hk-btn-top.hk-btn-close:hover {
            background-color: red;
        }
        
        
        a.hk-btn-top > span {
            font-size: 25px;
        }
    </style>
</head>

<body style="-webkit-app-region: drag">
    <div class="hk-titlebar">
        <span class="name">Eaiser PC</span>
        <a class="hk-btn-top hk-btn-close" onclick="closeMe()">
            <span>&times;</span>
        </a>
        <a class="hk-btn-top" onclick="maximizeMe()">
            <span>&plus;</span>
        </a>
        <a class="hk-btn-top" onclick="minimalMe()">
            <span>&minus;</span>
        </a>
    </div>
    <script>
        const remote = require('electron').remote;
        function closeMe(){
            remote.getCurrentWindow().close();
        }
        
        function minimalMe(){
            var win = remote.getCurrentWindow();
            if(win.isMinimized())
                win.restore();
            else
                win.minimize();
            win = null;
        }

        function maximizeMe(){
            var win = remote.getCurrentWindow();
            if(win.isMaximized())
                win.unmaximize();
            else
                win.maximize();
            win = null;
        }
    </script>
    <iframe id="fr_content" frameborder="0" height="100% -30px" width="100%" sandbox="allow-scripts">
    </iframe>
</body>

</html>