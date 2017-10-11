describe('Testing source controller', function () {
    var controller, scope, configService, deferred, $q, httpBackend;

    var windowMock = {
        alert: function(message) {

        }
    };

    beforeEach(function () {
        // load the module
        module('sourceApp', function ($provide) {
            $provide.value('$window', windowMock);
        });

        spyOn(windowMock, 'alert');

        inject(function($controller, $rootScope, _$q_, _configService_, _$httpBackend_){
            scope = $rootScope.$new();
            $q = _$q_;
            httpBackend = _$httpBackend_;
            configService = _configService_;

            deferred = _$q_.defer();
            spyOn(configService, "getConfig").and.returnValue(deferred.promise);

            controller = $controller('SourceCtrl', {
                $scope: scope,
                configService: configService
            });
        });
    });

    it('should define the source controller', function() {
        expect(controller).toBeDefined();
    });

    it('should define the function submit()', function(){
        expect(controller.submit).toBeDefined();
    })

    it('should define the function upload()', function(){
        expect(controller.upload).toBeDefined();
    })

    it('should call the service to get configuration list', function() {
        var result = [{
            mission: "ATest",
            source: {
                filename: "GMAT-6.xlsx",
                ipaddress: "10.0.0.16",
                name: "GMAT"
            }
        }]
        deferred.resolve({ data : result });
    
        // We have to call digest cycle for this to work
        scope.$digest();

        expect(configService.getConfig).toHaveBeenCalled();
        expect(controller.configlist).toBeDefined();
        expect(controller.configlist).toEqual(result);
    });

    it('should call the upload function when upload form is valid', function(){
        var args = {
            name :  "SIM.xlsx"
        };

        controller.upload_form = {
            $valid: true
        };

        controller.config = {
            file: {
                name :  "SIM.xlsx"
            },
            mission: "ATest",
            sourceip :  "10.0.0.14" ,
            sourcename :  "GMAT" 
        };

        spyOn(controller, "upload");

        controller.submit();
        expect(controller.upload).toHaveBeenCalled();
        expect(controller.upload).toHaveBeenCalledWith(args);
    })

    it('should alert the user when upload form is valid but the file property does not exist', function(){
        controller.upload_form = {
            $valid: true
        };

        controller.config = {
            mission: "ATest",
            sourceip :  "10.0.0.14" ,
            sourcename :  "GMAT" 
        }

        controller.submit();
        expect(windowMock.alert).toHaveBeenCalledWith('No file passed. Please upload an xlsx file.');
    })

    it('should upload file when upload() is called and successfully alert the user', function(){
        controller.upload_form = {
            $valid: true,
            $setPristine : function(){}
        };
        controller.config = {
            file: {
                name :  "SIM.xlsx"
            },
            mission: "ATest",
            sourceip :  "10.0.0.14" ,
            sourcename :  "GMAT" 
        };

        var response = {
            config: {
                data: {
                    file:{
                        name: 'SIM.xlsx'
                    }
                }
            },
            error_code : 0
        }

        var mockFile = {
            "name": "SIM.xlsx", 
            "size": 10759, 
            "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        httpBackend.when('POST', '/upload').respond(200, response);
        controller.upload(mockFile);    
        httpBackend.flush();

        expect(windowMock.alert).toHaveBeenCalledWith('Success: SIM.xlsx uploaded.');
        expect(controller.config).toEqual({});
    })

    it('should alert user on upload file error', function(){
        controller.config = {
            file: {
                name :  "SIM.xlsx"
            },
            mission: "ATest",
            sourceip :  "10.0.0.14" ,
            sourcename :  "GMAT" 
        };

        var response = {
            error_code : 1
        }

        var mockFile = {
            "name": "SIM.xlsx", 
            "size": 10759, 
            "type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        };

        httpBackend.when('POST', '/upload').respond(200, response);
        controller.upload(mockFile);    
        httpBackend.flush();
        
        expect(windowMock.alert).toHaveBeenCalledWith('an error occured');
    })

});