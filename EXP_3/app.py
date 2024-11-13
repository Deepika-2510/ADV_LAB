import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import plotly.figure_factory as ff
import numpy as np
from scipy import stats
import seaborn as sns
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

# Set page config
st.set_page_config(layout="wide", page_title="Cholera Data Analysis Dashboard")

# Load data
@st.cache_data
def load_data():
    df = pd.read_csv('/Users/deepika/Documents/College/ADV/exp3/data.csv')
    return df

df = load_data()

# Title and description
st.title("Global Cholera Analysis Dashboard")
st.markdown("""
This dashboard provides comprehensive insights into global cholera cases, deaths, and fatality rates across different regions and time periods.
""")

# Sidebar for filtering
st.sidebar.header("Filters")
selected_year = st.sidebar.slider("Select Year Range", min_value=int(df['Year'].min()), 
                                max_value=int(df['Year'].max()), 
                                value=(int(df['Year'].min()), int(df['Year'].max())))
selected_regions = st.sidebar.multiselect("Select WHO Regions", 
                                        options=df['WHO Region'].unique(),
                                        default=df['WHO Region'].unique())

# Filter data based on selection
filtered_df = df[
    (df['Year'].between(selected_year[0], selected_year[1])) &
    (df['WHO Region'].isin(selected_regions))
]

# Layout with tabs
tab1, tab2, tab3 = st.tabs(["Basic Charts", "Advanced Charts", "Statistical Analysis"])

with tab1:
    st.header("Basic Visualizations")
    
    col1, col2 = st.columns(2)
    
    with col1:
        # Bar Chart
        st.subheader("Average Cases by WHO Region")
        fig_bar = px.bar(filtered_df.groupby('WHO Region')['Number of reported cases of cholera'].mean().reset_index(),
                        x='WHO Region', y='Number of reported cases of cholera',
                        title="Average Cholera Cases by Region")
        st.plotly_chart(fig_bar)
        
        # Pie Chart
        st.subheader("Distribution of Cases Across Regions")
        fig_pie = px.pie(filtered_df, values='Number of reported cases of cholera', 
                        names='WHO Region', title="Distribution of Cases")
        st.plotly_chart(fig_pie)
    
    with col2:
        # Scatter Plot
        st.subheader("Cases vs Deaths Scatter Plot")
        fig_scatter = px.scatter(filtered_df, x='Number of reported cases of cholera',
                               y='Number of reported deaths from cholera',
                               color='WHO Region', hover_data=['Country', 'Year'])
        st.plotly_chart(fig_scatter)
        
        # Bubble Plot
        st.subheader("Bubble Plot: Cases, Deaths, and Fatality Rate")
        fig_bubble = px.scatter(filtered_df, x='Number of reported cases of cholera',
                              y='Number of reported deaths from cholera',
                              size='Cholera case fatality rate',
                              color='WHO Region',
                              hover_name='Country',
                              title="Bubble Plot of Cases, Deaths, and Fatality Rate")
        st.plotly_chart(fig_bubble)

with tab2:
    st.header("Advanced Visualizations")
    
    col3, col4 = st.columns(2)
    
    with col3:
        # Box Plot
        st.subheader("Box Plot of Cases by Region")
        fig_box = px.box(filtered_df, x='WHO Region', y='Number of reported cases of cholera',
                        title="Distribution of Cases by Region")
        st.plotly_chart(fig_box)
        
        # Violin Plot
        st.subheader("Violin Plot of Fatality Rates")
        fig_violin = px.violin(filtered_df, x='WHO Region', y='Cholera case fatality rate',
                             title="Distribution of Fatality Rates")
        st.plotly_chart(fig_violin)
    
    with col4:
        # 3D Scatter Plot
        st.subheader("3D Visualization")
        fig_3d = px.scatter_3d(filtered_df, x='Number of reported cases of cholera',
                              y='Number of reported deaths from cholera',
                              z='Cholera case fatality rate',
                              color='WHO Region',
                              title="3D Relationship between Cases, Deaths, and Fatality Rate")
        st.plotly_chart(fig_3d)
        
        # Treemap
        st.subheader("Treemap of Cases by Region and Country")
        fig_treemap = px.treemap(filtered_df,
                                path=['WHO Region', 'Country'],
                                values='Number of reported cases of cholera',
                                title="Hierarchical View of Cholera Cases")
        st.plotly_chart(fig_treemap)

with tab3:
    st.header("Statistical Analysis")
    
    # Regression Analysis
    st.subheader("Regression Analysis: Cases vs Deaths")
    fig_regression = px.scatter(filtered_df, x='Number of reported cases of cholera',
                              y='Number of reported deaths from cholera',
                              trendline="ols",
                              title="Linear Regression: Cases vs Deaths")
    st.plotly_chart(fig_regression)
    
    # Calculate correlation coefficient
    correlation = filtered_df['Number of reported cases of cholera'].corr(
        filtered_df['Number of reported deaths from cholera']
    )
    st.write(f"Correlation coefficient: {correlation:.2f}")

# Key Insights Section
st.header("Key Insights")
st.markdown("""
1. **Regional Distribution**: The treemap reveals which regions and countries have the highest burden of cholera cases.
2. **Case-Fatality Relationship**: The regression analysis shows the relationship between number of cases and deaths.
3. **Temporal Trends**: The time series visualizations demonstrate how cholera cases have evolved over the selected period.
4. **Regional Variations**: Box and violin plots highlight the differences in case distribution and fatality rates across regions.
5. **Outliers**: The 3D visualization and box plots help identify unusual patterns or outlier countries.
""")

# Download section
st.sidebar.header("Download Data")
csv = filtered_df.to_csv(index=False)
st.sidebar.download_button(
    label="Download filtered data as CSV",
    data=csv,
    file_name='filtered_cholera_data.csv',
    mime='text/csv',
)