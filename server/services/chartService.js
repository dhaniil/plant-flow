class ChartService {
  constructor(db) {
    if (!db) {
      throw new Error('Database connection is required');
    }
    this.db = db;
    this.client = null;
    this.charts = new Map();
    this.subscribeToCharts();
  }

  async handleMqttMessage(topic, message) {
    try {
      const chartCollection = this.db.collection('graphs');
      const charts = await chartCollection.find({ topic }).toArray();

      for (const chart of charts) {
        const value = parseFloat(message.toString());
        const timestamp = new Date().toLocaleTimeString();
        
        let chartData = this.charts.get(chart._id.toString()) || { data: [], labels: [] };
        
        if (chartData.data.length >= 20) {
          chartData.data = chartData.data.slice(1);
          chartData.labels = chartData.labels.slice(1);
        }
        
        chartData.data.push(value);
        chartData.labels.push(timestamp);
        
        this.charts.set(chart._id.toString(), chartData);
        
        await chartCollection.updateOne(
          { _id: chart._id },
          { 
            $set: { 
              data: chartData.data,
              labels: chartData.labels,
              last_updated: new Date()
            } 
          }
        );
      }
    } catch (error) {
      console.error('Error handling MQTT message for chart:', error);
    }
  }

  getChartData(chartId) {
    return this.charts.get(chartId.toString());
  }

  async subscribeToCharts() {
    try {
      const chartCollection = this.db.collection('graphs');
      const charts = await chartCollection.find({}).toArray();
      
      for (const chart of charts) {
        if (chart.topic) {
          this.client.subscribe(chart.topic, (err) => {
            if (err) {
              console.error(`Failed to subscribe to ${chart.topic}:`, err);
            } else {
            }
          });
        }
      }
    } catch (error) {
      console.error('Error subscribing to charts:', error);
    }
  }
}

export default ChartService; 