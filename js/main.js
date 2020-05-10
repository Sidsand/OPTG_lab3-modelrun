var container;
var camera, scene, renderer;
var imagedata;
var N = 500;
var spotlight;
var sphere;
var geometry;

var clock = new THREE.Clock();
var mixer, morphs = [];
var keyboard;
var model;

var flamingoPath, flamingoPath2, storkPath;
var vertices = [];


var axisX = new THREE.Vector3(0.5, 0, 0);
var axisY = new THREE.Vector3(0, 0.5, 0);
var axisZ = new THREE.Vector3(0, 0, 0.1);
var parrot;
init();
animate();

function init()
{   
    
    
    keyboard = new THREEx.KeyboardState();

    container = document.getElementById( 'container' );
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 4000 );
    
    
    // Установка позиции камеры
    camera.position.set(N/1, N/1, N*2);
    // Установка точки, на которую камера будет смотреть
    camera.lookAt(new THREE.Vector3( N/2, 0.0, N/2));
    
    
    // Создание отрисовщика
    renderer = new THREE.WebGLRenderer( { antialias: false } );
    renderer.setSize( window.innerWidth, window.innerHeight );

    // Закрашивание экрана синим цветом, заданным в 16ричной системе
    renderer.setClearColor( 0x999999, 1);
    
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    
    container.appendChild( renderer.domElement );
    // Добавление функции обработки события изменения размеров окна
    window.addEventListener( 'resize', onWindowResize, false );



    // создание направленного источника освещения
    var light = new THREE.DirectionalLight(0xffffff);
   
    // позиция источника освещения
    light.position.set( N*1.5, N*1.5, N/1.5 );

    // направление освещения
    light.target = new THREE.Object3D();
    light.target.position.set( N/2, 0, N/2 );
    scene.add(light.target);
    // включение расчёта теней
    light.castShadow = true;
    
    // параметры области расчёта теней
    light.shadow = new THREE.LightShadow( new THREE.PerspectiveCamera( 50, 1, 1, 2500 ) );
    light.shadow.bias = 0.0001;
    // размер карты теней
    light.shadow.mapSize.width = 2048;
    light.shadow.mapSize.height = 2048;
    scene.add( light );

    

    var helper = new THREE.CameraHelper(light.shadow.camera);
    scene.add( helper );

    
    //создание списка анимаций в функции Init
    mixer = new THREE.AnimationMixer( scene );

    var canvas = document.createElement('canvas'); 
    var context = canvas.getContext('2d'); 
    var img = new Image(); 
    
    img.onload = function() 
    {     
        canvas.width = img.width;     
        canvas.height = img.height;     
        context.drawImage(img, 0, 0 );     
        imagedata = context.getImageData(0, 0, img.width, img.height); 

      
        // Пользовательская функция генерации ландшафта     
        CreateTerrain(); 
    } 
        
    parrot = loadAnimatedModel('models/anim/Parrot.glb', storkPath, true);

    flamingoPath = addFlamingoT();
    loadAnimatedModel('models/anim/Flamingo.glb', flamingoPath, false);
    flamingoPath2 = addFlamingoT2();
    loadAnimatedModel('models/anim/Flamingo.glb', flamingoPath2, false);
    storkPath = addStorkT();
    loadAnimatedModel('models/anim/Stork.glb', storkPath, false);
   
    
    
    loadModel('models/static/', 'Tree.obj', 'Tree.mtl');
    loadModel('models/static/', 'needle01.obj', 'needle01.mtl');
        
       

    addkos("img/sky.jpg");


    // Загрузка изображения с картой высот 
    img.src = 'plateau.jpg'; 

 
    // создание направленного источника освещения
   

    var geometry = new THREE.SphereGeometry( 5, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    sphere = new THREE.Mesh( geometry, material );
    scene.add( sphere );

    //  spotlight.position.x = N/2+N*Math.cos(a);
  //  spotlight.position.y = N*Math.sin(a);

    sphere.position.copy(light.position);

}

function addkos(texture)
{   
    var loader = new THREE.TextureLoader(); 
    var geometry = new THREE.SphereGeometry( 1300, 32, 32 );

    tex = loader.load( texture );
    tex.minFilter = THREE.NearestFilter;

    //создание материала
    var material = new THREE.MeshBasicMaterial({
            map: tex,
            side: THREE.DoubleSide
            });
    

    pos = new THREE.Vector3(N/2, 0, N/2);
    sphere = new THREE.Mesh( geometry, material );
    sphere.position.copy(pos);
    scene.add( sphere ); 

}


function onWindowResize()
{
    // Изменение соотношения сторон для виртуальной камеры
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    // Изменение соотношения сторон рендера
    renderer.setSize( window.innerWidth, window.innerHeight );
}

var a = 0.0;
var b = 0.0;

var w = 255.0;
var L = 0.0;

var T = 10.0;
var t = 0.0;

var followStork = false;
var followFlamingo1 = false;
var followFlamingo2 = false;

// В этой функции можно изменять параметры объектов и обрабатывать действия пользователя
function animate()
{
    
    // воспроизведение анимаций (в функции animate)
    var delta = clock.getDelta();

   

    mixer.update( delta );

    
    for ( var i = 0; i < morphs.length; i ++ )
    {
        var morph = morphs[ i ];
        var pos = new THREE.Vector3();

        if (t>=T) 
            t=0.0;

        pos.copy(morph.route.getPointAt(t/T));
        morph.mesh.position.copy(pos);
        
        t+= 0.002;

        if ( t >= T) 
            t = 0.0;

        var nextPoint = new THREE.Vector3();
        nextPoint.copy(morph.route.getPointAt((t)/T));
        morph.mesh.lookAt(nextPoint);
    
        if (followStork && i==0){
            followcam(morph)
        }

        if (followFlamingo1 && i==1){
            followcam(morph);
        }

        if (followFlamingo2 && i==2){
            followcam(morph);
        }

        if(parrot!=null)
        {
            var relativeCameraOffset = new THREE.Vector3(0, 15, -40 );
            var m1 = new THREE.Matrix4();
            var m2 = new THREE.Matrix4();

            m1.extractRotation(parrot.matrixWorld);
            m2.copyPosition(parrot.matrixWorld);
            m1.multiplyMatrices(m2, m1);

            var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
            camera.position.copy(cameraOffset);
            camera.lookAt(parrot.position );

            parrot.translateZ(15*delta);

            if (keyboard.pressed("a")) 
            { 
                parrot.rotateOnAxis(axisY, Math.PI/30.0);
            }   
            if (keyboard.pressed("d")) 
            { 
                parrot.rotateOnAxis(axisY, -Math.PI/30.0);
            } 
            if (keyboard.pressed("s")) 
            { 
                parrot.rotateOnAxis(axisX, Math.PI/30.0);
        
            }   
            if (keyboard.pressed("w")) 
            { 
                parrot.rotateOnAxis(axisX, -Math.PI/30.0);
            } 
        }
    }

    a += 0.01;
    if (keyboard.pressed("left")) 
    { 
        b+=0.025;

    }   
    if (keyboard.pressed("right")) 
    { 
        b-=0.025;

    }   

    if (keyboard.pressed("up")) 
    { 
        w-=0.5;

    }   
    if (keyboard.pressed("down")) 
    { 
        w+=0.5;

    }   
    if (keyboard.pressed("l")) 
    { 
        L-=1;

    }   
    if (keyboard.pressed("o")) 
    { 
        L+=1;

    }   
    
    // Добавление функции на вызов, при перерисовки браузером страницы
    requestAnimationFrame( animate );
    render();

        var x = N/2+2*w*Math.cos(b);
        var z = N/2+2*w*Math.sin(b);
            // Установка позиции камеры
        camera.position.set(x, w/1, z);


        // Установка точки, на которую камера будет смотреть
        camera.lookAt(new THREE.Vector3( N/2, L, N/2));

       
    

    if (keyboard.pressed("0")){
        followStork = false;
        followFlamingo1 = false;
        followFlamingo2 = false;
        camera.position.set(x, w/1, z);
        camera.lookAt(new THREE.Vector3( N/2, L, N/2));
    }

    if (keyboard.pressed("1")){
        followStork = true;
        followFlamingo1 = false;
        followFlamingo2 = false;
    }

    if (keyboard.pressed("2")){
        followStork = false;
        followFlamingo1 = true;
        followFlamingo2 = false;
    }
    if (keyboard.pressed("3")){
        followStork = false;
        followFlamingo1 = false;
        followFlamingo2 = true;
    }
}


function render()
{
    // Рисование кадра
    renderer.render( scene, camera );
}

function CreateTerrain()
{
    
    // Создание структуры для хранения вершин
    geometry = new THREE.Geometry();
    // Добавление координат вершин в массив вершин
    for (var j = 0; j < N; j++)
    for (var i = 0; i < N; i++)
    {
        var h = getPixel( imagedata, i, j ); 
        geometry.vertices.push(new THREE.Vector3( i, h/5.0, j));
    }
    
        for (var j = 0; j < N-1; j++)
            for (var i = 0; i < N-1; i++)
            {
                var i1 = i + j*N;
                var i2 = (i+1) + j*N;
                var i3 = (i+1) + (j+1)*N;
                var i4 = i + (j+1)*N;

                //Добавление индексов (порядок соединения вершин) в массив индексов
                geometry.faces.push(new THREE.Face3(i1, i2, i3));
                geometry.faces.push(new THREE.Face3(i1, i3, i4));

                geometry.faceVertexUvs[0].push([new THREE.Vector2(i/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1))]); 
    
                geometry.faceVertexUvs[0].push([new THREE.Vector2(i/(N-1), j/(N-1)),      new THREE.Vector2((i+1)/(N-1), (j+1)/(N-1)),      new THREE.Vector2(i/(N-1), (j+1)/(N-1))]); 
        
            }
    


    geometry.computeFaceNormals(); 
    geometry.computeVertexNormals(); 

    // Создание загрузчика текстур 
    var loader = new THREE.TextureLoader(); 
    // Загрузка текстуры grasstile.jpg из папки pics 
    var tex = loader.load( 'unnamed.jpg' );

    var mat = new THREE.MeshLambertMaterial
    ({     
        map:tex,     
        wireframe: false,     
        side:THREE.DoubleSide 
    }); 



    // Создание объекта и установка его в определённую позицию
    var Mesh = new THREE.Mesh(geometry, mat);
    Mesh.position.set(0.0, 0.0, 0.0);
    // Добавление объекта в сцену

    Mesh.receiveShadow = true;



    scene.add(Mesh);


}

function getPixel( imagedata, x, y ) 
{    var position = ( x + imagedata.width * y ) * 4, data = imagedata.data;     
    return data[ position ];; 
}

var k=0;

function loadModel(path, oname, mname)
{
    // функция, выполняемая в процессе загрузки модели (выводит процент загрузки)
    var onProgress = function ( xhr ) {
        if ( xhr.lengthComputable ) {
        var percentComplete = xhr.loaded / xhr.total * 100;
        console.log( Math.round(percentComplete, 2) + '% downloaded' );
    }
    };
    // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var onError = function ( xhr ) { };
    // функция, выполняющая обработку ошибок, возникших в процессе загрузки
    var mtlLoader = new THREE.MTLLoader();
    mtlLoader.setPath( path );
    // функция загрузки материала
    mtlLoader.load( mname, function( materials )
    {
    materials.preload();
    var objLoader = new THREE.OBJLoader();
    objLoader.setMaterials( materials );
    objLoader.setPath( path );
    // функция загрузки модели
    
    objLoader.load( oname, function ( object )
    {
       
        object.castShadow = true;

        object.traverse( function ( child )
        {
            if ( child instanceof THREE.Mesh )
            {
                child.castShadow = true;
            }
        } );

        for(i=0;i<100;i++)
        {
            var x = Math.random()*N;
            var z = Math.random()*N;
            var y = geometry.vertices[Math.round(x)+Math.round(z)*N].y;

            object.position.x = x;
            object.position.y = y;
            object.position.z = z;


            var s = (Math.random() *100) + 60;
            s/=700.0;
            
            if(k==1){
                object.scale.set(s, s, s);
            }
            else{
                object.scale.set(3,3,3);
            }
            scene.add(object.clone());
        } 
        k=1;
    }, onProgress, onError );
    });
}


function loadAnimatedModel(path, route, control) //где path – путь и название модели
{
    var loader = new THREE.GLTFLoader();

        loader.load( path, function ( gltf ) 
        {
            var mesh = gltf.scene.children[ 0 ];
            var clip = gltf.animations[ 0 ];
            //установка параметров анимации (скорость воспроизведения и стартовый фрейм)
            mixer.clipAction( clip, mesh ).setDuration( 1 ).startAt( 0 ).play();
                

                    
            mesh.position.set( N/2, N/5, N/2 );
            mesh.rotation.y = Math.PI / 8;

            mesh.scale.set( 0.06, 0.06, 0.06 );
        
            mesh.castShadow = true;
            
        
            scene.add( mesh );
            
            
            model = {};
            model.mesh = mesh;
            model.route = route;

            if (control==false)
                morphs.push( model );
            else
                parrot = mesh;
            //return mesh;
        } );
}
  
function addFlamingoT()
{
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 255, 70, 255 ), //P0
        new THREE.Vector3( 500, 70, 250 ), //P1
        new THREE.Vector3( 250, 50, 500 ), //P2
        new THREE.Vector3( 245, 55, 255  ) //P3
       );
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 255, 55, 245 ), //P0
        new THREE.Vector3( 250, 80, 0 ), //P1
        new THREE.Vector3( 0, 100, 250 ), //P2
        new THREE.Vector3( 245, 70, 245  ) //P3
       );
        
        // получение 20-ти точек на заданной кривой
        vertices = curve1.getPoints( 40 );
        vertices = vertices.concat(curve2.getPoints( 40 ));

        // создание кривой по списку точек
        var path = new THREE.CatmullRomCurve3(vertices);
        // является ли кривая замкнутой (зацикленной)
        path.closed = true;
                
        

        var geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        var material = new THREE.LineBasicMaterial( { color : 0xff0000 } );
        var curveObject = new THREE.Line( geometry, material );
        scene.add(curveObject);
        return path;
}

function addFlamingoT2()
{
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 100 , 50, 400 ), //P0
        new THREE.Vector3( 200, 60, 550 ), //P1
        new THREE.Vector3( 400, 60, 400 ), //P2
        new THREE.Vector3( 345, 60, 320  ) //P3
       );
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 345, 60, 300 ), //P0
        new THREE.Vector3( 300, 70, 180 ), //P1
        new THREE.Vector3( 0, 60, 250 ), //P2
        new THREE.Vector3( 100, 130, 350  ) //P3
       );
        
        // получение 20-ти точек на заданной кривой
        vertices = curve1.getPoints( 20 );
        vertices = vertices.concat(curve2.getPoints( 20 ));

        // создание кривой по списку точек
        var path = new THREE.CatmullRomCurve3(vertices);
        // является ли кривая замкнутой (зацикленной)
        path.closed = true;
                
        

        var geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        var material = new THREE.LineBasicMaterial( { color : 0xff00ff } );
        var curveObject = new THREE.Line( geometry, material );
        scene.add(curveObject);
        return path;
}

function addStorkT()
{
    var curve1 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 480 , 60, 250 ), //P0
        new THREE.Vector3( 480, 70, 40 ), //P1
        new THREE.Vector3( 460, 75, 20 ), //P2
        new THREE.Vector3( 250, 80, 20  ) //P3
       );
    var curve2 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 250, 80, 20 ), //P0
        new THREE.Vector3( 40, 75, 20 ), //P1
        new THREE.Vector3( 20, 70, 40 ), //P2
        new THREE.Vector3( 20, 60, 250  ) //P3
       );
    var curve3 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 20, 60, 250 ), //P0
        new THREE.Vector3( 20, 55, 460 ), //P1
        new THREE.Vector3( 40, 55, 480 ), //P2
        new THREE.Vector3( 250, 50, 480  ) //P3
       );
    var curve4 = new THREE.CubicBezierCurve3(
        new THREE.Vector3( 250, 50, 480 ), //P0
        new THREE.Vector3( 460, 55, 480 ), //P1
        new THREE.Vector3( 480, 55, 460 ), //P2
        new THREE.Vector3( 480, 60, 250  ) //P3
       );

        // получение 20-ти точек на заданной кривой
        vertices = curve1.getPoints( 20 );
        vertices = vertices.concat(curve2.getPoints( 20 ));
        vertices = vertices.concat(curve3.getPoints( 20 ));
        vertices = vertices.concat(curve4.getPoints( 20 ));

        // создание кривой по списку точек
        var path = new THREE.CatmullRomCurve3(vertices);
        // является ли кривая замкнутой (зацикленной)
        path.closed = true;
                
        

        var geometry = new THREE.Geometry();
        geometry.vertices = vertices;
        var material = new THREE.LineBasicMaterial( { color : 0xffff00 } );
        var curveObject = new THREE.Line( geometry, material );
        scene.add(curveObject);
        return path;
}


function followcam(morph)
{
    var relativeCameraOffset = new THREE.Vector3(0, 15, -40 );
    var m1 = new THREE.Matrix4();
    var m2 = new THREE.Matrix4();

    m1.extractRotation(morph.mesh.matrixWorld);
    m2.copyPosition(morph.mesh.matrixWorld);
    m1.multiplyMatrices(m2, m1);

    var cameraOffset = relativeCameraOffset.applyMatrix4(m1);
    camera.position.copy(cameraOffset);
    camera.lookAt(morph.mesh.position );
}