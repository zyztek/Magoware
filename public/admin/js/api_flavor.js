function requestInterceptor(RestangularProvider) {

    RestangularProvider.addFullRequestInterceptor(function(element, operation, what, url, headers, params) {



        if (operation == "getList") {

            params._start = (params._page - 1) * params._perPage;
            params._end = params._page * params._perPage;
            delete params._page;
            delete params._perPage;

            // custom sort params
            if (params._sortField) {
                params._orderBy = params._sortField;
                params._orderDir = params._sortDir;
                delete params._sortField;
                delete params._sortDir;
            }

            // custom filters
            if (params._filters) {
                for (var filter in params._filters) {
                    params[filter] = params._filters[filter];
                }
                delete params._filters;
            }

            //defautl values parameters
            const hash = location.hash;
            if (hash.includes('defaultValues=')) {
                const search = 'defaultValues=';
                const defaultValuesStr = decodeURIComponent(hash.substring(hash.indexOf(search) + search.length));
                const defaultValues = JSON.parse(defaultValuesStr);
                const key0 = Object.keys(defaultValues)[0];
                const key1 = Object.keys(defaultValues)[1];
                params[key0] = defaultValues[key0];
            }


        }
        else {

        }

        return { params: params };
    });
}

export default { requestInterceptor }
