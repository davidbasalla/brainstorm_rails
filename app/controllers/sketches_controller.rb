class SketchesController < ApplicationController
  before_action :set_sketch, only: [:show, :edit, :update, :destroy]

  # GET /sketches
  # GET /sketches.json
  def index
    @sketches = Sketch.all
  end

  # GET /sketches/1
  # GET /sketches/1.json
  def show
    @sketches = Sketch.all
    @sketch = @sketches.first if @sketch.nil?

    respond_to do |format|
      format.html { render :show }
      format.json { render json: @sketch }
    end

    #TODO need to cater for possibility of no sketch being present?
  end

  # GET /sketches/new
  def new
    @sketch = Sketch.new
  end

  # GET /sketches/1/edit
  def edit
  end

  # POST /sketches
  # POST /sketches.json
  def create
    @sketch = Sketch.new(name: new_sketch_name)

    respond_to do |format|
      if @sketch.save
        format.html { redirect_to @sketch, notice: 'Sketch was successfully created.' }
        format.json { render :show, status: :created, location: @sketch }
      else
        format.html { render :new }
        format.json { render json: @sketch.errors, status: :unprocessable_entity }
      end
    end
  end

  # PATCH/PUT /sketches/1
  # PATCH/PUT /sketches/1.json
  def update
    @sketch.update(sketch_params)
    render :nothing => true
  end

  # DELETE /sketches/1
  # DELETE /sketches/1.json
  def destroy
    @sketch.destroy
    respond_to do |format|
      format.html { redirect_to root_path, notice: 'Sketch was successfully destroyed.' }
      format.json { head :no_content }
    end
  end

  private
  # Use callbacks to share common setup or constraints between actions.
  def set_sketch
    if params[:id]
      @sketch = Sketch.find(params[:id])
    end
  end

  # Never trust parameters from the scary internet, only allow the white list through.
  def sketch_params
    params.require(:sketch).permit(:name, :node_data)
  end

  def new_sketch_name
    "sketch_#{Sketch.all.count}"
  end
end
