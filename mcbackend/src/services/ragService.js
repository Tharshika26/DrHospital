const fs = require('fs');
const path = require('path');

/**
 * A simple RAG (Retrieval-Augmented Generation) service.
 * In a production environment, this would use a Vector Database (like Pinecone or ChromaDB)
 * and Embeddings (OpenAI text-embedding-3-small).
 * 
 * For this implementation, we use a keyword-based retrieval from a curated knowledge base.
 */

const KNOWLEDGE_BASE_PATH = path.join(__dirname, '..', 'data', 'medicalKnowledge.json');

const retrieveMedicalContext = async (extractedText) => {
    try {
        if (!fs.existsSync(KNOWLEDGE_BASE_PATH)) {
            console.warn("Medical Knowledge Base not found. Returning empty context.");
            return "No reference context available.";
        }

        const rawData = fs.readFileSync(KNOWLEDGE_BASE_PATH, 'utf-8');
        const knowledgeBase = JSON.parse(rawData);

        const lowerText = extractedText.toLowerCase();
        
        // Find relevant facts based on keywords present in the report
        const relevantFacts = knowledgeBase.filter(fact => {
            const testName = fact.testName.toLowerCase();
            // Check if test name is mentioned in the report
            return lowerText.includes(testName) || 
                   (fact.category && lowerText.includes(fact.category.toLowerCase()));
        });

        if (relevantFacts.length === 0) {
            return "No specific reference ranges found for the detected tests. Use general medical knowledge.";
        }

        // Format the retrieved facts into a single context string
        const contextString = relevantFacts.map((fact, index) => {
            return `[${index + 1}] Test: ${fact.testName}\n` +
                   `Category: ${fact.category}\n` +
                   `Reference Range: ${fact.referenceRange}\n` +
                   `Clinical Note: ${fact.description}\n` +
                   `Low Level Meaning: ${fact.lowIndications}\n` +
                   `High Level Meaning: ${fact.highIndications}\n` +
                   `Simplified Explanation: ${fact.simplifiedExplanation}\n`;
        }).join('\n---\n');

        return contextString;
    } catch (err) {
        console.error("Error in RAG retrieval service:", err);
        return "An error occurred while retrieving clinical context.";
    }
};

module.exports = { retrieveMedicalContext };
