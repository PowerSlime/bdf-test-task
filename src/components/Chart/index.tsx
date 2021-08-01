import axios from 'axios';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Button, FormControl, Spinner } from 'react-bootstrap';
import DayPickerInput from 'react-day-picker/DayPickerInput';

import toMoney from '../../utils/to-money';

dayjs.extend(utc);

interface ResponseField {
  date: string;
  volume: number;
  close: number;
  open: number;
  low: number;
  high: number;
  change: number;
}

interface ChartProps {
  className?: string;
}

const Chart: FC<ChartProps> = ({ className }) => {
  const [startDate, setStartDate] = useState(dayjs().subtract(1, 'month'));
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<Array<ResponseField> | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await axios.get<Array<ResponseField>>('https://cloud.iexapis.com/v1/stock/aapl/chart/1m', {
        params: { token: process.env.REACT_APP_IEX_TOKEN },
      });
      setData(response.data);
    } catch (e) {
      console.error(e);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const options = useMemo<Highcharts.Options>((): Highcharts.Options => {
    return {
      title: {
        text: '',
      },

      legend: {
        enabled: false,
      },

      xAxis: {
        type: 'datetime',
        showEmpty: true,
        crosshair: {
          snap: false,
          dashStyle: 'LongDash',
        },
      },

      yAxis: [
        {
          opposite: true,
          labels: {
            align: 'left',
            x: 5,
          },
          title: {
            text: '',
          },
          height: '75%',
          lineWidth: 2,
          resize: {
            enabled: true,
          },
          crosshair: {
            snap: false,
            dashStyle: 'LongDash',
          },
        },
        {
          opposite: true,
          labels: {
            align: 'left',
            x: 5,
          },
          title: {
            text: '',
          },
          top: '80%',
          height: '20%',
          offset: 0,
          lineWidth: 2,
        },
      ],

      tooltip: {
        pointFormatter() {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          const point = this;

          const { id } = point.series.userOptions;

          // eslint-disable-next-line no-unused-vars
          const { y, open, high, low, close, change, volume } = point.options as Record<string, any>;

          if (id === 'volume-related') {
            return `<strong>Volume</strong> ${toMoney(y)}`;
          }

          return [
            `<strong>Open</strong> ${toMoney(open)}<br />`,
            `<strong>High</strong> ${toMoney(high)}<br />`,
            `<strong>Low</strong> ${toMoney(low)}<br />`,
            `<strong>Close</strong> ${toMoney(close)}<br />`,
            `<strong>Volume</strong> ${toMoney(volume)}<br />`,
            `<strong>% Change</strong> ${change.toFixed(2)}`,
          ].join('');
        },
      },

      series: [
        {
          id: 'price-related',
          type: 'line',
          name: 'Close',
          data: data?.map((entry) => ({
            x: dayjs(`${entry.date}`).unix(),
            y: entry.close,
            close: entry.close,
            open: entry.open,
            high: entry.high,
            low: entry.low,
            volume: entry.volume,
            change: entry.change,
          })),
        },
        {
          id: 'volume-related',
          type: 'column',
          data: data?.map((entry) => [dayjs(`${entry.date}`).unix(), entry.volume]),
          yAxis: 1,
          label: {
            enabled: false,
          },
        },
      ],
    };
  }, [data]);

  return (
    <div className={className}>
      <div className="d-flex my-2 flex-wrap">
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          1D
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          1W
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="success">
          1M
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          3M
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          6M
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          1Y
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          2Y
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          5Y
        </Button>
        <Button className="mx-1 my-1" size="sm" variant="outline-secondary">
          ALL
        </Button>

        <div className="flex-fill" />

        <div className="mx-1 my-1">
          <DayPickerInput
            component={FormControl}
            style={{ width: 150 }}
            value={startDate.format('DD/MM/YYYY')}
            onDayChange={(date) => setStartDate(dayjs(date))}
          />
          -
          <DayPickerInput
            component={FormControl}
            style={{ width: 150 }}
            value={startDate.add(1, 'month').format('DD/MM/YYYY')}
            onDayChange={(date) => setStartDate(dayjs(date).subtract(1, 'month'))}
          />
        </div>
      </div>

      {!isLoading && data && <HighchartsReact highchart={Highcharts} options={options} />}
      {isLoading && (
        <div className="d-flex justify-content-center">
          <Spinner animation="border" />
        </div>
      )}
    </div>
  );
};

export default memo(Chart);
