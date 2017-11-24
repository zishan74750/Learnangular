
    var app=angular.module('testmodule',['ngComponentRouter','ngRoute']);
app.component('mySecondcomponent',{
    templateUrl:'temp2.html',
    controller:function()
    {
      
       this.testSecond=function()
        {
               alert('Second Controller Clicked');
        };

        this.name='Rendering Second Component';
    }
       
 });