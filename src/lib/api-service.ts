import axios from 'axios';

// Types based on the API specification from api.md
export interface DetailedClass {
  class: string;
  description: string;
  probability: number;
  percentage: number;
  confidence_level: string;
}

export interface BinaryClassification {
  no_dr: number;
  dr_detected: number;
  primary_assessment: string;
}

export interface ClinicalInformation {
  findings: string;
  risks: string;
  recommendations: string;
  follow_up: string;
  explanation: string;
  suggested_questions: string[];
}

export interface SuggestedQuestion {
  question: string;
  answer: string;
}

export interface AnalysisResponse {
  analysis_id: string;
  timestamp: string;
  detailed_classification: DetailedClass[];
  binary_classification: BinaryClassification;
  highest_probability_class: string;
  severity_index: number;
  recommendation: string;
  clinical_information: ClinicalInformation;
  ai_explanation: string;
  suggested_questions_with_answers: SuggestedQuestion[];
  performance: {
    inference_time_ms: number;
    total_processing_time_ms: number;
  };
}

// Legacy types for compatibility with existing UI
export type ResultLevel = 'Низкий' | 'Средний' | 'Высокий';

export interface AnalysisResult {
  // Primary classification data
  analysis_id: string;
  timestamp: string;
  highest_probability_class: string;
  detailed_classification: DetailedClass[];
  binary_classification: BinaryClassification;
  severity_index: number;
  
  // Clinical information
  recommendation: string;
  clinical_information: ClinicalInformation;
  
  // AI explanation and questions
  ai_explanation: string;
  suggested_questions_with_answers: SuggestedQuestion[];
  
  // Performance metrics
  performance?: {
    inference_time_ms: number;
    total_processing_time_ms: number;
  };
  
  // Legacy fields for compatibility - calculated from the above
  riskLevel: ResultLevel;
}

// Base API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL;

// API Service functions
export const apiService = {
  // Get API information
  async getApiInfo() {
    try {
      const response = await axios.get(`${API_URL}/`);
      return response.data;
    } catch (error) {
      console.error('Error fetching API info:', error);
      throw error;
    }
  },

  // Check API health
  async checkHealth() {
    try {
      const response = await axios.get(`${API_URL}/health`);
      return response.data;
    } catch (error) {
      console.error('Error checking API health:', error);
      throw error;
    }
  },

  // Get model information
  async getModelInfo() {
    try {
      const response = await axios.get(`${API_URL}/model-info`);
      return response.data;
    } catch (error) {
      console.error('Error fetching model info:', error);
      throw error;
    }
  },

  // Upload and analyze an image
  async analyzeImage(imageFile: File): Promise<AnalysisResult> {
    try {
      // Create form data
      const formData = new FormData();
      formData.append('file', imageFile);

      // Make API request
      const response = await axios.post(`${API_URL}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const apiResponse: AnalysisResponse = response.data;
      
      // Convert the API response to our internal format
      return convertApiResponseToAnalysisResult(apiResponse);
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw error;
    }
  },

  // Upload and analyze image from base64 string
  async analyzeImageBase64(imageBase64: string): Promise<AnalysisResult> {
    try {
      // Convert base64 to blob
      const base64Data = imageBase64.split(',')[1];
      const blob = base64ToBlob(base64Data, 'image/jpeg');
      const file = new File([blob], "retina-scan.jpg", { type: 'image/jpeg' });
      
      return await this.analyzeImage(file);
    } catch (error) {
      console.error('Error analyzing base64 image:', error);
      throw error;
    }
  },

  // Get analysis by ID
  async getAnalysis(analysisId: string): Promise<AnalysisResult> {
    try {
      const response = await axios.get(`${API_URL}/analysis/${analysisId}`);
      const apiResponse: AnalysisResponse = response.data;
      
      return convertApiResponseToAnalysisResult(apiResponse);
    } catch (error) {
      console.error('Error fetching analysis:', error);
      throw error;
    }
  },

  // Get AI consultation
  async getConsultation(analysisId: string, question: string) {
    try {
      const response = await axios.post(`${API_URL}/consult`, {
        analysis_id: analysisId,
        question: question,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error getting consultation:', error);
      throw error;
    }
  },

  // Generate report
  async generateReport(analysisId: string, includeConsultation = true) {
    try {
      const response = await axios.get(
        `${API_URL}/generate-report/${analysisId}?include_consultation=${includeConsultation}`,
        { responseType: 'blob' }
      );
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `diabetly-report-${analysisId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  },
};

// Helper function to convert API response to our internal format
function convertApiResponseToAnalysisResult(apiResponse: AnalysisResponse): AnalysisResult {
  // Determine risk level based on highest_probability_class
  let riskLevel: ResultLevel = 'Средний';
  if (apiResponse.highest_probability_class === 'Нет ДР') {
    riskLevel = 'Низкий';
  } else if (apiResponse.highest_probability_class === 'Severe' || apiResponse.highest_probability_class === 'Proliferative DR') {
    riskLevel = 'Высокий';
  } else {
    riskLevel = 'Средний';
  }

  return {
    // Direct pass-through of API response fields
    analysis_id: apiResponse.analysis_id,
    timestamp: apiResponse.timestamp,
    highest_probability_class: apiResponse.highest_probability_class,
    detailed_classification: apiResponse.detailed_classification,
    binary_classification: apiResponse.binary_classification,
    severity_index: apiResponse.severity_index,
    recommendation: apiResponse.recommendation,
    clinical_information: apiResponse.clinical_information,
    ai_explanation: apiResponse.ai_explanation,
    suggested_questions_with_answers: apiResponse.suggested_questions_with_answers,
    performance: apiResponse.performance,
    
    // Legacy fields for compatibility
    riskLevel,
  };
}

// Helper function to convert base64 to blob
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays, { type: mimeType });
} 