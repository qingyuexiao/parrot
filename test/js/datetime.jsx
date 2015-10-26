/**
 * Created by brad.wu on 8/16/2015.
 */
(function () {
    var model = $pt.createModel({
        name: null
    });
    var defaultFormat = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date
        },
        pos: {row: 1, col: 1}
    });
    var yearMonth = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'YYYY/MM'
        },
        pos: {row: 1, col: 1}
    });
    var year = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'YYYY'
        },
        pos: {row: 1, col: 1}
    });
    var monthDay = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'MM/DD'
        },
        pos: {row: 1, col: 1}
    });
    var datetime = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'YYYY/MM/DD HH:mm:ss'
        },
        pos: {row: 1, col: 1}
    });
    var time = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'HH:mm:ss'
        },
        pos: {row: 1, col: 1}
    });
    var disabledDefaultFormat = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            enabled: {
                when: function () {
                    return false;
                },
                depends: 'name'
            }
        },
        pos: {row: 1, col: 1}
    });

    var taiwan = $pt.createCellLayout('name', {
        label: 'Plain Text',
        comp: {
            type: $pt.ComponentConstants.Date,
            format: 'tYY/MM/DD',
            dayViewHeaderFormat: '民國tYY年MM月',
            headerYearFormat: '民國tYY年',
            locale: 'zh-TW',
            valueFormat: $pt.ComponentConstants.Default_Date_Format
        },
        pos: {row: 1, col: 1}
    });

    var panel = (<div className='row'>
        <div className='col-md-3 col-lg-3 col-sm-3'>
            <span>Default Format</span>
            <NDateTime model={model} layout={defaultFormat}/>
            <span>YYYY/MM</span>
            <NDateTime model={model} layout={yearMonth}/>
            <span>YYYY</span>
            <NDateTime model={model} layout={year}/>
            <span>MM/DD</span>
            <NDateTime model={model} layout={monthDay}/>
            <span>Data Time</span>
            <NDateTime model={model} layout={datetime}/>
            <span>Time</span>
            <NDateTime model={model} layout={time}/>
            <span>Taiwan Format</span>
            <NDateTime model={model} layout={taiwan}/>
        </div>
        <div className='col-md-3 col-lg-3 col-sm-3 has-error'>
            <span>Error Default Format</span>
            <NDateTime model={model} layout={defaultFormat}/>
        </div>
        <div className='col-md-3 col-lg-3 col-sm-3'>
            <span>Disabled Default Format</span>
            <NDateTime model={model} layout={disabledDefaultFormat}/>
        </div>
        <div className='col-md-3 col-lg-3 col-sm-3 has-error'>
            <span>Error Disabled Default Format</span>
            <NDateTime model={model} layout={disabledDefaultFormat}/>
        </div>
    </div>);
    React.render(panel, document.getElementById('main'));
})();