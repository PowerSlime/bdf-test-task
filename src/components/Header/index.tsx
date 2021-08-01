import axios from 'axios';
import clsx from 'clsx';
import { FC, memo, useCallback, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';

import toMoney from '../../utils/to-money';

const SECOND = 1000;
const REFRESH_RATE = SECOND * 30;

interface QuoteResponse {
  marketCap: number;
  changePercent: number;
  symbol: string;
  companyName: string;
  latestPrice: number;
}

interface HeaderProps {
  className?: string;
}

const Header: FC<HeaderProps> = ({ className }) => {
  const [data, setData] = useState<QuoteResponse>({
    symbol: 'LOADING...',
    changePercent: 0,
    companyName: 'LOADING...',
    latestPrice: 0,
    marketCap: 0,
  });

  const fetchData = useCallback(async () => {
    try {
      const response = await axios.get<QuoteResponse>('https://cloud.iexapis.com/v1/stock/aapl/quote', {
        params: { token: process.env.REACT_APP_IEX_TOKEN },
      });
      setData(response.data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const timerId = setInterval(() => {
      fetchData();
    }, REFRESH_RATE);

    return () => {
      clearInterval(timerId);
    };
  }, [fetchData]);

  const formattedMarketCup = useMemo(() => {
    return toMoney(data.marketCap);
  }, [data.marketCap]);

  const change = useMemo(() => {
    const percent = data.changePercent;
    const isPositive = percent > 0;

    const sign = isPositive ? '+' : '';
    const formattedPercent = `${sign}${percent.toFixed(2)}%`;

    const classes = clsx(isPositive ? 'text-success' : 'text-danger');
    return <h6 className={classes}>{formattedPercent}</h6>;
  }, [data.changePercent]);

  return (
    <Row className={className}>
      <Col md={12} lg={10}>
        <div>
          <h2>{data.symbol}</h2>
          <h5 className="text-secondary">{data.companyName}</h5>
        </div>
        <div className="mt-4">
          <h5>Earnings: 2021-02-25 (BMO)</h5>
          <div className="text-secondary">Market Cap: {formattedMarketCup}</div>
        </div>
      </Col>
      <Col md={12} lg={2}>
        <div>
          <h2>{data.latestPrice.toFixed(2)}</h2>
          <div>{change}</div>
        </div>
      </Col>
    </Row>
  );
};

export default memo(Header);
